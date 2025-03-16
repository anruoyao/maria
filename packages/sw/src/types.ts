import type { entities } from "firefish-js";

export type SwMessageOrderType = "post" | "push";

export type SwMessage = {
	type: "order";
	order: SwMessageOrderType;
	loginId?: string;
	url: string;
	[x: string]: unknown;
};

type PushNotificationDataSourceMap = {
	notification: entities.Notification;
	unreadAntennaNote: {
		antenna: { id: string; name: string };
		note: entities.Note;
	};
	readAllNotifications: undefined;
	readAllMessagingMessages: undefined;
	readAllMessagingMessagesOfARoom: { userId: string } | { groupId: string };
};

export type PushNotificationData<
	K extends keyof PushNotificationDataSourceMap,
> = {
	type: K;
	body: PushNotificationDataSourceMap[K];
	userId: string;
	dateTime: number;
};

export type PushNotificationDataMap = {
	[K in keyof PushNotificationDataSourceMap]: PushNotificationData<K>;
};

export type BadgeNames =
	| "null"
	| "at"
	| "boost"
	| "check"
	| "clipboard-check"
	| "clock"
	| "comments"
	| "id-card"
	| "messages"
	| "plus"
	| "poll"
	| "quote"
	| "reaction"
	| "reply"
	| "user-plus";
