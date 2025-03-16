import {
	publishToChatStream,
	publishToGroupChatStream,
	publishToChatIndexStream,
	renderRead,
	sendPushNotification,
	publishToMainStream,
	Event,
} from "backend-rs";
import type { User, IRemoteUser } from "@/models/entities/user.js";
import type { MessagingMessage } from "@/models/entities/messaging-message.js";
import { MessagingMessages, UserGroupJoinings, Users } from "@/models/index.js";
import { In } from "typeorm";
import { IdentifiableError } from "@/misc/identifiable-error.js";
import type { UserGroup } from "@/models/entities/user-group.js";
import { toArray } from "@/prelude/array.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { deliver } from "@/queue/index.js";
import orderedCollection from "@/remote/activitypub/renderer/ordered-collection.js";
import { unsafeCast } from "@/prelude/unsafe-cast.js";

/**
 * Mark messages as read
 */
export async function readUserMessagingMessage(
	userId: User["id"],
	otherpartyId: User["id"],
	messageIds: MessagingMessage["id"][],
) {
	if (messageIds.length === 0) return;

	const messages = await MessagingMessages.findBy({
		id: In(messageIds),
	});

	for (const message of messages) {
		if (message.recipientId !== userId) {
			throw new IdentifiableError(
				"e140a4bf-49ce-4fb6-b67c-b78dadf6b52f",
				"Access denied (user).",
			);
		}
	}

	// Update documents
	await MessagingMessages.update(
		{
			id: In(messageIds),
			userId: otherpartyId,
			recipientId: userId,
			isRead: false,
		},
		{
			isRead: true,
		},
	);

	// Publish event
	await Promise.all([
		publishToChatStream(otherpartyId, userId, "read", messageIds),
		publishToChatIndexStream(userId, "read", messageIds),
	]);

	if (!(await Users.getHasUnreadMessagingMessage(userId))) {
		// 全ての(いままで未読だった)自分宛てのメッセージを(これで)読みましたよというイベントを発行
		await publishToMainStream(userId, Event.ReadAllChats, {});
		await sendPushNotification(userId, "readAllChats", {});
	} else {
		// そのユーザーとのメッセージで未読がなければイベント発行
		const hasUnread = await MessagingMessages.existsBy({
			userId: otherpartyId,
			recipientId: userId,
			isRead: false,
		});

		if (!hasUnread) {
			await sendPushNotification(userId, "readAllChatsInTheRoom", {
				userId: otherpartyId,
			});
		}
	}
}

/**
 * Mark messages as read
 */
export async function readGroupMessagingMessage(
	userId: User["id"],
	groupId: UserGroup["id"],
	messageIds: MessagingMessage["id"][],
) {
	if (messageIds.length === 0) return;

	// check joined
	const joining = await UserGroupJoinings.findOneBy({
		userId: userId,
		userGroupId: groupId,
	});

	if (joining == null) {
		throw new IdentifiableError(
			"930a270c-714a-46b2-b776-ad27276dc569",
			"Access denied (group).",
		);
	}

	const messages = await MessagingMessages.findBy({
		id: In(messageIds),
	});

	const reads: MessagingMessage["id"][] = [];

	for (const message of messages) {
		if (message.userId === userId) continue;
		if (message.reads.includes(userId)) continue;

		// Update document
		await MessagingMessages.createQueryBuilder()
			.update()
			.set({
				reads: (() => `array_append("reads", '${joining.userId}')`) as any,
			})
			.where("id = :id", { id: message.id })
			.execute();

		reads.push(message.id);
	}

	// Publish events
	await Promise.all([
		publishToGroupChatStream(groupId, "read", {
			ids: reads,
			userId,
		}),
		publishToChatIndexStream(userId, "read", reads),
	]);

	if (!(await Users.getHasUnreadMessagingMessage(userId))) {
		// 全ての(いままで未読だった)自分宛てのメッセージを(これで)読みましたよというイベントを発行
		await publishToMainStream(userId, Event.ReadAllChats, {});
		await sendPushNotification(userId, "readAllChats", {});
	} else {
		// そのグループにおいて未読がなければイベント発行
		const hasUnread = await MessagingMessages.createQueryBuilder("message")
			.where("message.groupId = :groupId", { groupId: groupId })
			.andWhere("message.userId != :userId", { userId: userId })
			.andWhere("NOT (:userId = ANY(message.reads))", { userId: userId })
			.andWhere("message.createdAt > :joinedAt", {
				joinedAt: joining.createdAt,
			}) // 自分が加入する前の会話については、未読扱いしない
			.getOne()
			.then((x) => x != null);

		if (!hasUnread) {
			await sendPushNotification(userId, "readAllChatsInTheRoom", {
				groupId,
			});
		}
	}
}

export async function deliverReadActivity(
	user: { id: User["id"]; host: null },
	recipient: IRemoteUser,
	messages: MessagingMessage | MessagingMessage[],
) {
	messages = toArray(messages).filter((x) => x.uri);
	const contents = messages.map((x) =>
		unsafeCast<Record<string, unknown>>(renderRead(user.id, x.uri)),
	);

	if (contents.length > 1) {
		const collection = orderedCollection(
			null,
			contents.length,
			undefined,
			undefined,
			contents,
		);
		deliver(user.id, renderActivity(collection), recipient.inbox);
	} else {
		for (const content of contents) {
			deliver(user.id, renderActivity(content), recipient.inbox);
		}
	}
}
