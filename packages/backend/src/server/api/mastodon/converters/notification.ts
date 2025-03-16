import type { ILocalUser, User } from "@/models/entities/user.js";
import type { Notification } from "@/models/entities/notification.js";
import type { notificationTypes } from "@/types.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { awaitAll } from "@/prelude/await-all.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { getNote } from "@/server/api/common/getters.js";
import {
	getStubMastoContext,
	type MastoContext,
} from "@/server/api/mastodon/index.js";
import { Notifications } from "@/models/index.js";
import { unique } from "@/prelude/array.js";
import type { Note } from "@/models/entities/note.js";
import type { SwSubscription } from "@/models/entities/sw-subscription.js";
import { fetchMeta, isQuote } from "backend-rs";
import { getNoteSummary, getTimestamp } from "backend-rs";
import type { Packed } from "@/misc/schema";
import { I18n } from "@/misc/i18n.js";
import locales from "../../../../../../../locales/index.mjs";

type NotificationType = (typeof notificationTypes)[number];

export class NotificationConverter {
	public static async encode(
		notification: Notification,
		ctx: MastoContext,
	): Promise<MastodonEntity.Notification> {
		const localUser = ctx.user as ILocalUser;
		if (notification.notifieeId !== localUser.id)
			throw new Error("User is not recipient of notification");

		const account = notification.notifierId
			? UserHelpers.getUserCached(notification.notifierId, ctx).then((p) =>
					UserConverter.encode(p, ctx),
				)
			: UserConverter.encode(localUser, ctx);

		let result = {
			id: notification.id,
			account: account,
			created_at: notification.createdAt.toISOString(),
			type: this.encodeNotificationType(notification.type),
		};

		const note =
			notification.note ??
			(notification.noteId
				? await getNote(notification.noteId, localUser)
				: null);

		if (note) {
			const encodedNote =
				note.renoteId !== null && !isQuote(note)
					? getNote(note.renoteId, localUser).then((note) =>
							NoteConverter.encode(note, ctx),
						)
					: NoteConverter.encode(note, ctx);
			result = Object.assign(result, {
				status: encodedNote,
			});
			if (result.type === "poll") {
				result = Object.assign(result, {
					account: encodedNote.then((p) => p.account),
				});
			}
			if (notification.reaction) {
				// FIXME: Implement reactions;
			}
		}
		return awaitAll(result);
	}

	public static async encodeMany(
		notifications: Notification[],
		ctx: MastoContext,
	): Promise<MastodonEntity.Notification[]> {
		await this.aggregateData(notifications, ctx);
		const encoded = notifications.map((u) => this.encode(u, ctx));
		return Promise.all(encoded).then(
			(p) => p.filter((n) => n !== null) as MastodonEntity.Notification[],
		);
	}

	private static async aggregateData(
		notifications: Notification[],
		ctx: MastoContext,
	): Promise<void> {
		if (notifications.length === 0) return;
		const notes = unique(
			notifications.filter((p) => p.note != null).map((n) => n.note as Note),
		);
		const users = unique(
			notifications
				.filter((p) => p.notifier != null)
				.map((n) => n.notifier as User)
				.concat(
					notifications
						.filter((p) => p.notifiee != null)
						.map((n) => n.notifiee as User),
				),
		);
		await NoteConverter.aggregateData(notes, ctx);
		await UserConverter.aggregateData(users, ctx);
	}

	private static encodeNotificationType(
		t: NotificationType,
	): MastodonEntity.NotificationType {
		// FIXME: Implement custom notification for followRequestAccepted
		// FIXME: Implement mastodon notification type 'update' on misskey side
		switch (t) {
			case "follow":
				return "follow";
			case "mention":
			case "reply":
				return "mention";
			case "renote":
				return "reblog";
			case "quote":
				return "reblog";
			case "reaction":
				return "favourite";
			case "pollEnded":
				return "poll";
			case "receiveFollowRequest":
				return "follow_request";
			case "followRequestAccepted":
			case "pollVote":
			case "groupInvited":
			case "app":
				throw new Error(`Notification type ${t} not supported`);
		}
	}

	public static async encodeNotificationTypeOrDefault(
		t: NotificationType,
	): Promise<string> {
		try {
			return this.encodeNotificationType(t);
		} catch (e) {
			return t;
		}
	}

	public static async encodeEvent(
		target: Notification["id"],
		user: ILocalUser,
		filterContext?: string,
	): Promise<MastodonEntity.Notification | null> {
		const ctx = getStubMastoContext(user, filterContext);
		const notification = await Notifications.findOneByOrFail({ id: target });
		return this.encode(notification, ctx).catch((_) => null);
	}

	public static async encodeSubscription(
		subscription: SwSubscription,
		ctx: MastoContext,
	): Promise<MastodonEntity.PushSubscription> {
		const instanceMeta = await fetchMeta();
		const result: MastodonEntity.PushSubscription = {
			id: subscription.id,
			endpoint: subscription.endpoint,
			server_key: instanceMeta.swPublicKey ?? "",
			alerts: {
				follow: subscription.subscriptionTypes.includes("follow"),
				favourite: subscription.subscriptionTypes.includes("favourite"),
				mention: subscription.subscriptionTypes.includes("mention"),
				reblog: subscription.subscriptionTypes.includes("reblog"),
				poll: subscription.subscriptionTypes.includes("poll"),
				status: subscription.subscriptionTypes.includes("status"),
			},
		};

		// IceCubes wants an int for ID despite the docs says string.
		if (ctx.tokenApp?.name === "IceCubesApp") {
			result.id = getTimestamp(subscription.id);
		}

		return result;
	}

	public static async encodePushNotificationPayloadForRust(
		body: Packed<"Notification">,
		lang = "en-US",
	): Promise<Partial<MastodonEntity.NotificationPayload>> {
		const locale = locales[lang] || locales["en-US"];
		const i18n = new I18n(locale);

		let preferred_locale = lang;
		let notification_id = "";
		let notification_type = "others";
		let icon: string | undefined = undefined;
		let title = i18n.t("notificationType");
		let description = "";

		const notificationBody = body;
		preferred_locale = notificationBody.note?.lang ?? preferred_locale;
		notification_id = notificationBody.id;
		notification_type = await this.encodeNotificationTypeOrDefault(
			notificationBody.type,
		);
		const effectiveNote =
			notificationBody.note?.renote ?? notificationBody.note;

		icon =
			notificationBody.user?.avatarUrl ??
			notificationBody.note?.user.avatarUrl ??
			notificationBody.icon ??
			undefined;
		const displayName =
			notificationBody.user?.name ||
			(notificationBody.user?.host &&
				`@${notificationBody.user?.username}@${notificationBody.user?.host}`) ||
			(notificationBody.user?.username &&
				`@${notificationBody.user?.username}`) ||
			"Someone";
		const username =
			(notificationBody.user?.host &&
				`@${notificationBody.user?.username}@${notificationBody.user?.host}`) ||
			(notificationBody.user?.username &&
				`@${notificationBody.user?.username}`) ||
			"";

		// FIXME: all notification title i18n strings should take `name` as a parameter
		switch (notificationBody.type) {
			case "mention":
				title = i18n.t("_notification.youGotMention", { name: displayName });
				break;
			case "reply":
				title = i18n.t("_notification.youGotReply", { name: displayName });
				break;
			case "renote":
				title = i18n.t("_notification.youRenoted", { name: displayName });
				break;
			case "quote":
				title = i18n.t("_notification.youGotQuote", { name: displayName });
				break;
			case "reaction":
				title = `${displayName} ${i18n.t("_notification.reacted")}`;
				break;
			case "pollVote":
				title = i18n.t("_notification.youGotPoll", { name: displayName });
				break;
			case "pollEnded":
				title = i18n.t("_notification.pollEnded");
				break;
			case "followRequestAccepted":
				title = i18n.t("_notification.yourFollowRequestAccepted");
				break;
			case "groupInvited":
				title = i18n.t("_notification.youWereInvitedToGroup", {
					userName: displayName,
				});
				break;
			case "follow":
				title = `${displayName} ${i18n.t("_notification.youWereFollowed")}`;
				break;
			case "receiveFollowRequest":
				title = i18n.t("_notification.youReceivedFollowRequest");
				break;
			case "app":
				title = `${notificationBody.header}`;
				break;
			default:
				title = `${i18n.t("notificationType")} ${notificationBody.type}`;
		}
		description =
			(effectiveNote &&
				getNoteSummary(
					effectiveNote.fileIds,
					effectiveNote.text,
					effectiveNote.cw,
					effectiveNote.hasPoll,
				)) ||
			notificationBody.body ||
			username ||
			"";

		return {
			preferred_locale,
			notification_id,
			notification_type,
			icon,
			title,
			body: description,
		};
	}
}
