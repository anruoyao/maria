import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";
import mfm from "mfm-js";
import type { Announcement } from "@/models/entities/announcement.js";
import type { MastoContext } from "..";
import { I18n } from "@/misc/i18n.js";
import locales from "../../../../../../../locales/index.mjs";

export class AnnouncementConverter {
	public static async encode(
		announcement: Announcement,
		isRead: boolean,
		lang = "en-US",
		ctx: MastoContext,
	): Promise<MastodonEntity.Announcement> {
		const locale = locales[lang] || locales["en-US"];
		const i18n = new I18n(locale);

		return {
			id: announcement.id,
			content: `<h1>${
				(await MfmHelpers.toHtml(
					mfm.parse(announcement.title),
					[],
					null,
					false,
					null,
					ctx,
				)) ?? i18n.t("announcement")
			}</h1>${
				(await MfmHelpers.toHtml(
					mfm.parse(announcement.text),
					[],
					null,
					false,
					null,
					ctx,
				)) ?? ""
			}`,
			starts_at: null,
			ends_at: null,
			published: true,
			all_day: false,
			published_at: announcement.createdAt.toISOString(),
			updated_at:
				announcement.updatedAt?.toISOString() ??
				announcement.createdAt.toISOString(),
			read: isRead,
			mentions: [], //FIXME
			statuses: [],
			tags: [],
			emojis: [], //FIXME
			reactions: [],
		};
	}
}
