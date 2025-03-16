import { Brackets, In } from "typeorm";
import renderDelete from "@/remote/activitypub/renderer/delete.js";
import renderAnnounce from "@/remote/activitypub/renderer/announce.js";
import { renderUndo } from "@/remote/activitypub/renderer/undo.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { config } from "@/config.js";
import type { User, ILocalUser, IRemoteUser } from "@/models/entities/user.js";
import type { Note, IMentionedRemoteUsers } from "@/models/entities/note.js";
import { Notes, Users, Instances } from "@/models/index.js";
import {
	deliverToFollowers,
	deliverToUser,
} from "@/remote/activitypub/deliver-manager.js";
import { countSameRenotes } from "@/misc/count-same-renotes.js";
import { registerOrFetchInstanceDoc } from "@/services/register-or-fetch-instance-doc.js";
import { deliverToRelays } from "@/services/relay.js";
import type { IActivity } from "@/remote/activitypub/type.js";
import { NoteEvent, publishToNoteStream, renderTombstone } from "backend-rs";

async function recalculateNotesCountOfLocalUser(user: {
	id: User["id"];
	host: User["host"];
}) {
	if (Users.isLocalUser(user)) {
		await Notes.countBy({ userId: user.id }).then((newCount: number) =>
			Users.update(user.id, { updatedAt: new Date(), notesCount: newCount }),
		);
	}
}

/**
 * 投稿を削除します。
 * @param user 投稿者
 * @param note 投稿
 * @param deleteFromDb false if called by making private
 */
export default async function (
	user: { id: User["id"]; uri: User["uri"]; host: User["host"] },
	note: Note,
	deleteFromDb = true,
) {
	const deletedAt = new Date();

	// Whether this is a scheduled "draft" post
	const isDraft = note.scheduledAt != null;

	// この投稿を除く指定したユーザーによる指定したノートのリノートが存在しないとき
	if (
		!isDraft &&
		note.renoteId &&
		(await countSameRenotes(user.id, note.renoteId, note.id)) === 0 &&
		deleteFromDb
	) {
		Notes.decrement({ id: note.renoteId }, "renoteCount", 1);
		Notes.decrement({ id: note.renoteId }, "score", 1);
	}

	if (!isDraft && note.replyId != null && deleteFromDb) {
		await Notes.decrement({ id: note.replyId }, "repliesCount", 1);
	}

	const cascadingNotes = await findCascadingNotes(note);
	const affectedLocalUsers: Record<
		User["id"],
		{ id: User["id"]; uri: User["uri"]; host: null }
	> = {};
	if (Users.isLocalUser(user)) {
		affectedLocalUsers[user.id] = user;
	}
	const instanceNotesCountDecreasement: Record<string, number> = {};

	// Only broadcast "deleted" to local if the note is deleted from db
	if (deleteFromDb) {
		publishToNoteStream(note.id, NoteEvent.Delete, {
			deletedAt: deletedAt,
		});
	}

	//#region ローカルの投稿なら削除アクティビティを配送
	if (!isDraft && Users.isLocalUser(user) && !note.localOnly) {
		let renote: Note | null = null;

		// if deletd note is renote
		if (
			note.renoteId &&
			note.text == null &&
			!note.hasPoll &&
			(note.fileIds == null || note.fileIds.length === 0)
		) {
			renote = await Notes.findOneBy({
				id: note.renoteId,
			});
		}

		const content = renderActivity(
			renote
				? renderUndo(
						renderAnnounce(
							renote.uri || `${config.url}/notes/${renote.id}`,
							note,
						),
						user.id,
					)
				: renderDelete(renderTombstone(note.id), user),
		);

		deliverToConcerned(user, note, content);
	}

	// also deliever delete activity to cascaded notes
	for (const cascadingNote of cascadingNotes) {
		if (deleteFromDb) {
			// For other notes, publishNoteStream is also required.
			publishToNoteStream(cascadingNote.id, NoteEvent.Delete, {
				deletedAt: deletedAt,
			});
		}

		if (!cascadingNote.user) continue;
		if (!Users.isLocalUser(cascadingNote.user)) {
			if (!Users.isRemoteUser(cascadingNote.user)) continue;
			instanceNotesCountDecreasement[cascadingNote.user.host] ??= 0;
			instanceNotesCountDecreasement[cascadingNote.user.host]++;
			continue; // filter out remote users
		}
		affectedLocalUsers[cascadingNote.user.id] ??= cascadingNote.user;
		if (cascadingNote.localOnly) continue; // filter out local-only notes
		const content = renderActivity(
			renderDelete(renderTombstone(cascadingNote.id), cascadingNote.user),
		);
		deliverToConcerned(cascadingNote.user, cascadingNote, content);
	}
	//#endregion

	if (Users.isRemoteUser(user)) {
		instanceNotesCountDecreasement[user.host] ??= 0;
		instanceNotesCountDecreasement[user.host]++;
	}
	for (const [host, count] of Object.entries(instanceNotesCountDecreasement)) {
		registerOrFetchInstanceDoc(host).then((i) => {
			Instances.decrement({ id: i.id }, "notesCount", count);
		});
	}

	if (deleteFromDb) {
		await Notes.delete({
			id: note.id,
			userId: user.id,
		});

		// Handle cascading deletion (it's not as simple as notesCount -= 1)
		await Promise.all(
			Object.values(affectedLocalUsers).map((user) =>
				recalculateNotesCountOfLocalUser(user),
			),
		);
	}
}

async function findCascadingNotes(note: Note) {
	const cascadingNotes: Note[] = [];

	const findRepliesAndQuotes = async (noteId: string) => {
		const query = Notes.createQueryBuilder("note")
			.where("note.replyId = :noteId", { noteId })
			.orWhere(
				new Brackets((q) => {
					q.where("note.renoteId = :noteId", { noteId }).andWhere(
						"note.text IS NOT NULL",
					);
				}),
			)
			.leftJoinAndSelect("note.user", "user");
		const repliesAndQuotes = await query.getMany();

		await Promise.all(
			repliesAndQuotes.map((n: Note) => {
				cascadingNotes.push(n);
				return findRepliesAndQuotes(n.id);
			}),
		);
	};
	await findRepliesAndQuotes(note.id);

	return cascadingNotes;
}

async function getMentionedRemoteUsers(note: Note) {
	const where = [] as any[];

	// mention / reply / dm
	const uris = (
		JSON.parse(note.mentionedRemoteUsers) as IMentionedRemoteUsers
	).map((x) => x.uri);
	if (uris.length > 0) {
		where.push({ uri: In(uris) });
	}

	// renote / quote
	if (note.renoteUserId) {
		where.push({
			id: note.renoteUserId,
		});
	}

	if (where.length === 0) return [];

	return (await Users.find({
		where,
	})) as IRemoteUser[];
}

async function deliverToConcerned(
	user: { id: ILocalUser["id"]; host: null },
	note: Note,
	content: IActivity | null,
) {
	deliverToFollowers(user, content);
	deliverToRelays(user, content);
	const remoteUsers = await getMentionedRemoteUsers(note);
	for (const remoteUser of remoteUsers) {
		deliverToUser(user, content, remoteUser);
	}
}
