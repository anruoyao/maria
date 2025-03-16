import Channel from "../channel.js";
import { checkWordMute, fetchMeta } from "backend-rs";
import { isInstanceMuted } from "@/misc/is-instance-muted.js";
import { isUserRelated } from "@/misc/is-user-related.js";
import type { Packed } from "@/misc/schema.js";

export default class extends Channel {
	public readonly chName = "globalTimeline";
	public static shouldShare = true;
	public static requireCredential = false;
	private withReplies: boolean;

	constructor(id: string, connection: Channel["connection"]) {
		super(id, connection);
		this.onNote = this.withPackedNote(this.onNote.bind(this));
	}

	public async init(params: any) {
		const instanceMeta = await fetchMeta();
		if (instanceMeta.disableGlobalTimeline) {
			if (this.user == null || !(this.user.isAdmin || this.user.isModerator))
				return;
		}

		if (!instanceMeta.enableGuestTimeline && this.user == null) return;

		this.withReplies = params != null ? !!params.withReplies : true;

		// Subscribe events
		this.subscriber.on("notesStream", this.onNote);
	}

	private async onNote(note: Packed<"Note">) {
		if (note.visibility !== "public") return;
		if (note.channelId != null) return;

		// 関係ない返信は除外
		if (note.reply && !this.withReplies) {
			const reply = note.reply;
			// 「チャンネル接続主への返信」でもなければ、「チャンネル接続主が行った返信」でもなければ、「投稿者の投稿者自身への返信」でもない場合
			if (
				reply.userId !== this.user!.id &&
				note.userId !== this.user!.id &&
				reply.userId !== note.userId
			)
				return;
		}

		// Ignore notes from instances the user has muted
		if (
			isInstanceMuted(
				note,
				new Set<string>(this.userProfile?.mutedInstances ?? []),
			)
		)
			return;

		// 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
		if (isUserRelated(note, this.muting)) return;
		// 流れてきたNoteがブロックされているユーザーが関わるものだったら無視する
		if (isUserRelated(note, this.blocking)) return;

		if (note.renote && !note.text && this.renoteMuting.has(note.userId)) return;
		if (note.replyId != null && this.replyMuting.has(note.userId)) return;

		// 流れてきたNoteがミュートすべきNoteだったら無視する
		// TODO: 将来的には、単にMutedNoteテーブルにレコードがあるかどうかで判定したい(以下の理由により難しそうではある)
		// 現状では、ワードミュートにおけるMutedNoteレコードの追加処理はストリーミングに流す処理と並列で行われるため、
		// レコードが追加されるNoteでも追加されるより先にここのストリーミングの処理に到達することが起こる。
		// そのためレコードが存在するかのチェックでは不十分なので、改めてgetWordHardMuteを呼んでいる
		if (
			this.userProfile &&
			this.user?.id !== note.userId &&
			(await checkWordMute(
				note,
				this.userProfile.mutedWords,
				this.userProfile.mutedPatterns,
			))
		)
			return;

		this.connection.cacheNote(note);

		this.send("note", note);
	}

	public dispose() {
		// Unsubscribe events
		this.subscriber.off("notesStream", this.onNote);
	}
}
