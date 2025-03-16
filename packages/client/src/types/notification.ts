import type { entities } from "firefish-js";

export type FoldableNotification =
	| entities.RenoteNotification
	| entities.ReactionNotification
	| entities.PollVoteNotification;

interface Fold<T extends FoldableNotification> {
	id: string;
	type: T["type"];
	createdAt: T["createdAt"];
	note: T["note"];
	folded: true;
	userIds: entities.User["id"][];
	users: entities.User[];
	notifications: T[];
}

export type RenoteNotificationFolded = Fold<entities.RenoteNotification>;

export type ReactionNotificationFolded = Fold<entities.ReactionNotification> & {
	reaction: string;
};

export type PollVotedNotificationFolded = Fold<entities.PollVoteNotification>;

export type GetNotificationFoldedType<T extends FoldableNotification> =
	T["type"] extends "renote"
		? RenoteNotificationFolded
		: T["type"] extends "reaction"
			? ReactionNotificationFolded
			: PollVotedNotificationFolded;

export type NotificationFolded =
	| RenoteNotificationFolded
	| ReactionNotificationFolded
	| PollVotedNotificationFolded;
