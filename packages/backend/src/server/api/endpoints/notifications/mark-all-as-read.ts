import { Event, publishToMainStream, sendPushNotification } from "backend-rs";
import { Notifications } from "@/models/index.js";
import define from "@/server/api/define.js";

export const meta = {
	tags: ["notifications", "account"],

	requireCredential: true,

	kind: "write:notifications",
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async (_, user) => {
	// Update documents
	await Notifications.update(
		{
			notifieeId: user.id,
			isRead: false,
		},
		{
			isRead: true,
		},
	);

	// 全ての通知を読みましたよというイベントを発行
	await publishToMainStream(user.id, Event.ReadAllNotifications, {});
	await sendPushNotification(user.id, "readAllNotifications", {});
});
