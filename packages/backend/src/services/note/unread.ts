import type { Note } from "@/models/entities/note.js";
import type { User } from "@/models/entities/user.js";
import { Mutings, NoteThreadMutings, NoteUnreads } from "@/models/index.js";
import { Event, genId, publishToMainStream } from "backend-rs";

export async function insertNoteUnread(
	userId: User["id"],
	note: Note,
	params: {
		// NOTE: isSpecifiedがtrueならisMentionedは必ずfalse
		isSpecified: boolean;
		isMentioned: boolean;
	},
) {
	//#region ミュートしているなら無視
	// TODO: 現在の仕様ではChannelにミュートは適用されないのでよしなにケアする
	const mute = await Mutings.findBy({
		muterId: userId,
	});
	if (mute.map((m) => m.muteeId).includes(note.userId)) return;
	//#endregion

	// スレッドミュート
	const threadMute = await NoteThreadMutings.findOneBy({
		userId: userId,
		threadId: note.threadId || note.id,
	});
	if (threadMute) return;

	const unread = {
		id: genId(),
		noteId: note.id,
		userId: userId,
		isSpecified: params.isSpecified,
		isMentioned: params.isMentioned,
		noteChannelId: note.channelId,
		noteUserId: note.userId,
	};

	await NoteUnreads.insert(unread);

	// 2秒経っても既読にならなかったら「未読の投稿がありますよ」イベントを発行する
	setTimeout(async () => {
		const exists = await NoteUnreads.existsBy({ id: unread.id });

		if (!exists) return;

		if (params.isMentioned) {
			publishToMainStream(userId, Event.NewMention, note.id);
		}
		if (params.isSpecified) {
			publishToMainStream(userId, Event.NewDm, note.id);
		}
		if (note.channelId) {
			publishToMainStream(userId, Event.NewChannelPost, note.id);
		}
	}, 2000);
}
