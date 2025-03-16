import create from "@/services/note/create.js";
import { NoteFiles, Users } from "@/models/index.js";
import type { DbUserImportMastoPostJobData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import type Bull from "bull";
import { htmlToMfm } from "@/remote/activitypub/misc/html-to-mfm.js";
import { resolveNote } from "@/remote/activitypub/models/note.js";
import { uploadFromUrl } from "@/services/drive/upload-from-url.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import { Notes, NoteEdits } from "@/models/index.js";
import type { Note } from "@/models/entities/note.js";
import { genId } from "backend-rs";
import promiseLimit from "promise-limit";
import { unique, concat } from "@/prelude/array.js";
import type { CacheableUser } from "@/models/entities/user.js";
import { resolvePerson } from "@/remote/activitypub/models/person.js";
import { isPublic } from "@/remote/activitypub/audience.js";

const logger = queueLogger.createSubLogger("import-masto-post");

export async function importMastoPost(
	job: Bull.Job<DbUserImportMastoPostJobData>,
	done: any,
): Promise<void> {
	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		done();
		return;
	}
	const post = job.data.post;
	const isRenote = post.type === "Announce";
	let reply: Note | null = null;
	let renote: Note | null = null;
	job.progress(20);
	if (!isRenote && post.object.inReplyTo != null) {
		reply = await resolveNote(post.object.inReplyTo);
	}
	// renote also need resolve original note
	if (isRenote) {
		renote = await resolveNote(post.object);
	}
	job.progress(40);
	if (post.directMessage) {
		done();
		return;
	}
	if (job.data.signatureCheck) {
		if (!post.signature) {
			done();
			return;
		}
	}
	job.progress(60);
	let text;
	try {
		text = isRenote
			? undefined
			: htmlToMfm(post.object.content, post.object.tag);
	} catch (e) {
		throw e;
	}
	job.progress(80);

	let files: DriveFile[] = (post.object?.attachment || [])
		.map((x: any) => x?.driveFile)
		.filter((x: any) => x);

	if (!isRenote && files.length == 0) {
		const urls = post.object.attachment
			.map((x: any) => x.url)
			.filter((x: string) => x.startsWith("http"));
		files = [];
		for (const url of urls) {
			try {
				const file = await uploadFromUrl({
					url: url,
					user: user,
				});
				files.push(file);
			} catch (e) {
				logger.warn(`Skipped adding file to drive: ${url}`);
			}
		}
	}
	let note = await Notes.findOneBy({
		createdAt: isRenote
			? new Date(post.published)
			: new Date(post.object.published),
		text: text,
		userId: user.id,
	});

	// If an import is completely successful at once, the order should not be out of order.
	// If it takes multiple imports to complete, the order is not guaranteed to be consistent.
	if (note != null && files.length > 0) {
		const addFiles: DriveFile[] = [];
		for (const file of files) {
			if (!note.fileIds.includes(file.id)) {
				addFiles.push(file);
			}
		}

		const update: Partial<Note> = {};
		update.fileIds = addFiles.map((x) => x.id);

		if (update.fileIds != null) {
			await NoteFiles.insert(
				update.fileIds.map((fileId) => ({ noteId: note?.id, fileId })),
			);
		}

		update.fileIds = note.fileIds.concat(update.fileIds);

		await Notes.update(note.id, update);
		await NoteEdits.insert({
			id: genId(),
			noteId: note.id,
			text: note.text || undefined,
			cw: note.cw,
			fileIds: note.fileIds,
			updatedAt: new Date(),
		});
		logger.info("Post updated");
	}
	if (note == null) {
		let visibility = "specified";
		let visibleUsers: CacheableUser[] = [];
		if ((post.to as string[]).some(isPublic)) {
			visibility = "public";
		} else if ((post.cc as string[]).some(isPublic)) {
			visibility = "home";
		} else if ((post.cc as string[]).some((cc) => cc.endsWith("/followers"))) {
			visibility = "followers";
		} else {
			try {
				const visibleUsersList = unique(concat([post.to, post.cc]));

				const limit = promiseLimit<CacheableUser | null>(2);
				visibleUsers = (
					await Promise.all(
						visibleUsersList.map((id) =>
							limit(() => resolvePerson(id).catch(() => null)),
						),
					)
				).filter((x): x is CacheableUser => x != null);
			} catch {
				// nothing need to do.
			}
		}

		note = await create(
			user,
			{
				createdAt: isRenote
					? new Date(post.published)
					: new Date(post.object.published),
				scheduledAt: undefined,
				files: files.length === 0 ? undefined : files,
				poll: undefined,
				text: text || undefined,
				reply,
				renote,
				cw:
					!isRenote && post.object.sensitive ? post.object.summary : undefined,
				localOnly: false,
				visibility,
				visibleUsers,
				channel: null,
				apMentions: new Array(0),
				apHashtags: undefined,
				apEmojis: undefined,
			},
			false,
			undefined,
			true,
		);
		logger.debug("New post has been created");
	} else {
		logger.info("This post already exists");
	}
	job.progress(100);
	done();

	logger.info("Imported");
}
