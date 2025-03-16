import { MessagingMessages, Users } from "@/models/index.js";
import type { MessagingMessage } from "@/models/entities/messaging-message.js";
import {
	publishToChatStream,
	publishToGroupChatStream,
	renderTombstone,
} from "backend-rs";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import renderDelete from "@/remote/activitypub/renderer/delete.js";
import { deliver } from "@/queue/index.js";

export async function deleteMessage(message: MessagingMessage) {
	await MessagingMessages.delete(message.id);
	postDeleteMessage(message);
}

async function postDeleteMessage(message: MessagingMessage) {
	if (message.recipientId) {
		const [user, recipient] = await Promise.all([
			Users.findOneByOrFail({ id: message.userId }),
			Users.findOneByOrFail({ id: message.recipientId }),
		]);

		if (Users.isLocalUser(user))
			await publishToChatStream(
				message.userId,
				message.recipientId,
				"deleted",
				message.id,
			);
		if (Users.isLocalUser(recipient))
			await publishToChatStream(
				message.recipientId,
				message.userId,
				"deleted",
				message.id,
			);

		if (Users.isLocalUser(user) && Users.isRemoteUser(recipient)) {
			const activity = renderActivity(
				renderDelete(renderTombstone(message.id), user),
			);
			deliver(user.id, activity, recipient.inbox);
		}
	} else if (message.groupId != null) {
		await publishToGroupChatStream(message.groupId, "deleted", message.id);
	}
}
