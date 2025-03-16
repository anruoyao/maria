import type { CacheableUser, User } from "@/models/entities/user.js";
import type { UserGroup } from "@/models/entities/user-group.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import {
	MessagingMessages,
	UserGroupJoinings,
	Mutings,
	Users,
} from "@/models/index.js";
import {
	genIdAt,
	sendPushNotification,
	publishToChatStream,
	publishToGroupChatStream,
	publishToChatIndexStream,
	toPuny,
	publishToMainStream,
	Event,
} from "backend-rs";
import type { MessagingMessage } from "@/models/entities/messaging-message.js";
import { Not } from "typeorm";
import type { Note } from "@/models/entities/note.js";
import renderNote from "@/remote/activitypub/renderer/note.js";
import renderCreate from "@/remote/activitypub/renderer/create.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { deliver } from "@/queue/index.js";
import { Instances } from "@/models/index.js";

export async function createMessage(
	user: { id: User["id"]; host: User["host"] },
	recipientUser: CacheableUser | undefined,
	recipientGroup: UserGroup | undefined,
	text: string | null | undefined,
	file: DriveFile | null,
	uri?: string,
) {
	const now = new Date();
	const message = {
		id: genIdAt(now),
		createdAt: now,
		fileId: file ? file.id : null,
		recipientId: recipientUser ? recipientUser.id : null,
		groupId: recipientGroup ? recipientGroup.id : null,
		text: text ? text.trim() : null,
		userId: user.id,
		isRead: false,
		reads: [] as any[],
		uri,
	} as MessagingMessage;

	await MessagingMessages.insert(message);

	const messageObj = await MessagingMessages.pack(message);

	if (recipientUser) {
		if (Users.isLocalUser(user)) {
			// my stream
			await Promise.all([
				publishToChatStream(
					message.userId,
					recipientUser.id,
					"message",
					messageObj,
				),
				publishToChatIndexStream(message.userId, "message", messageObj),
				publishToMainStream(message.userId, Event.Chat, messageObj),
			]);
		}

		if (Users.isLocalUser(recipientUser)) {
			// recipient's stream
			await Promise.all([
				publishToChatStream(
					recipientUser.id,
					message.userId,
					"message",
					messageObj,
				),
				publishToChatIndexStream(recipientUser.id, "message", messageObj),
				publishToMainStream(recipientUser.id, Event.Chat, messageObj),
			]);
		}
	} else if (recipientGroup != null) {
		// group's stream
		await publishToGroupChatStream(recipientGroup.id, "message", messageObj);

		// member's stream
		const joinings = await UserGroupJoinings.findBy({
			userGroupId: recipientGroup.id,
		});
		for await (const joining of joinings) {
			await Promise.all([
				publishToChatIndexStream(joining.userId, "message", messageObj),
				publishToMainStream(joining.userId, Event.Chat, messageObj),
			]);
		}
	}

	// 2秒経っても(今回作成した)メッセージが既読にならなかったら「未読のメッセージがありますよ」イベントを発行する
	setTimeout(async () => {
		const freshMessage = await MessagingMessages.findOneBy({ id: message.id });
		if (freshMessage == null) return; // メッセージが削除されている場合もある

		if (recipientUser && Users.isLocalUser(recipientUser)) {
			if (freshMessage.isRead) return; // 既読

			//#region ただしミュートされているなら発行しない
			const mute = await Mutings.findBy({
				muterId: recipientUser.id,
			});
			if (mute.map((m) => m.muteeId).includes(user.id)) return;
			//#endregion

			await Promise.all([
				publishToMainStream(recipientUser.id, Event.NewChat, messageObj),
				sendPushNotification(recipientUser.id, "chat", messageObj),
			]);
		} else if (recipientGroup) {
			const joinings = await UserGroupJoinings.findBy({
				userGroupId: recipientGroup.id,
				userId: Not(user.id),
			});
			for await (const joining of joinings) {
				if (freshMessage.reads.includes(joining.userId)) return; // 既読
				await Promise.all([
					publishToMainStream(joining.userId, Event.NewChat, messageObj),
					sendPushNotification(joining.userId, "chat", messageObj),
				]);
			}
		}
	}, 2000);

	if (
		recipientUser &&
		Users.isLocalUser(user) &&
		Users.isRemoteUser(recipientUser)
	) {
		const instance = await Instances.findOneBy({
			host: toPuny(recipientUser.host),
		});
		const note = {
			id: message.id,
			createdAt: message.createdAt,
			fileIds: message.fileId ? [message.fileId] : [],
			text: message.text,
			userId: message.userId,
			visibility: "specified",
			mentions: [recipientUser].map((u) => u.id),
			mentionedRemoteUsers: JSON.stringify(
				[recipientUser].map((u) => ({
					uri: u.uri,
					username: u.username,
					host: u.host,
				})),
			),
		} as Note;

		let renderedNote: Record<string, unknown> = await renderNote(
			note,
			false,
			true,
		);

		// TODO: For pleroma and its fork instances, the actor will have a boolean "capabilities": { acceptsChatMessages: boolean } property. May use that instead of checking instance.softwareName. https://kazv.moe/objects/ca5c0b88-88ce-48a7-bf88-54d45f6ce781
		// ChatMessage document from Pleroma: https://docs.pleroma.social/backend/development/ap_extensions/#chatmessages
		// Note: LitePub has been stalled since 2019-06-29 and is incomplete as a specification
		if (
			instance?.softwareName &&
			["akkoma", "pleroma", "lemmy"].includes(
				instance.softwareName.toLowerCase(),
			)
		) {
			const tmp_note = renderedNote;
			renderedNote = {
				type: "ChatMessage",
				attributedTo: tmp_note.attributedTo,
				content: tmp_note.content,
				id: tmp_note.id,
				published: tmp_note.published,
				to: tmp_note.to,
				tag: tmp_note.tag,
				cc: [],
			};
			// A recently fixed bug, empty arrays will be rejected by pleroma
			if (
				Array.isArray(tmp_note.attachment) &&
				tmp_note.attachment.length !== 0
			) {
				renderedNote.attachment = tmp_note.attachment;
			}
		}

		const activity = renderActivity(renderCreate(renderedNote, note));

		deliver(user.id, activity, recipientUser.inbox);
	}
	return messageObj;
}
