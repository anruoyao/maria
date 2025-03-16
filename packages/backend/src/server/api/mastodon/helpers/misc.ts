import { config } from "@/config.js";
import { FILE_TYPE_BROWSERSAFE } from "@/const.js";
import { countLocalUsers, fetchMeta } from "backend-rs";
import {
	AnnouncementReads,
	Announcements,
	Emojis,
	Instances,
	Notes,
	UserProfiles,
	Users,
} from "@/models/index.js";
import { IsNull } from "typeorm";
import { awaitAll } from "@/prelude/await-all.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import type { Announcement } from "@/models/entities/announcement.js";
import type { ILocalUser, User } from "@/models/entities/user.js";
import { AnnouncementConverter } from "@/server/api/mastodon/converters/announcement.js";
import { genId, stringToAcct } from "backend-rs";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { generateMutedUserQueryForUsers } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockQueryForUsers } from "@/server/api/common/generate-block-query.js";
import { uniqBy } from "@/prelude/array.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { populateEmojis } from "@/misc/populate-emojis.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { VisibilityConverter } from "@/server/api/mastodon/converters/visibility.js";
import type { MastoContext } from "@/server/api/mastodon/index.js";

export class MiscHelpers {
	public static async getInstance(
		ctx: MastoContext,
	): Promise<MastodonEntity.Instance> {
		const userCount = countLocalUsers();
		const noteCount = Notes.count({ where: { userHost: IsNull() } });
		const instanceCount = Instances.count({ cache: 3600000 });
		const contact = await Users.findOne({
			where: {
				host: IsNull(),
				isAdmin: true,
				isDeleted: false,
				isSuspended: false,
			},
			order: { id: "ASC" },
		}).then((p) => (p ? UserConverter.encode(p, ctx) : null));
		const instanceMeta = await fetchMeta();

		const res = {
			uri: config.host,
			title: instanceMeta.name || "Firefish",
			short_description:
				instanceMeta.description?.substring(0, 50) ||
				"This is a Firefish instance. It doesn’t seem to have a description.",
			description:
				instanceMeta.description ||
				"This is a Firefish instance. It doesn’t seem to have a description.",
			email: instanceMeta.maintainerEmail || "",
			version: `4.2.8 (compatible; Firefish ${config.version})`,
			urls: {
				streaming_api: `${config.url.replace(/^http(?=s?:\/\/)/, "ws")}`,
			},
			stats: awaitAll({
				user_count: userCount,
				status_count: noteCount,
				domain_count: instanceCount,
			}),
			max_toot_chars: config.maxNoteLength,
			thumbnail: instanceMeta.bannerUrl || "/static-assets/transparent.png",
			languages: instanceMeta.langs,
			registrations: !instanceMeta.disableRegistration,
			approval_required: instanceMeta.disableRegistration,
			invites_enabled: instanceMeta.disableRegistration,
			configuration: {
				accounts: {
					max_featured_tags: 20,
				},
				statuses: {
					supported_mime_types: ["text/x.misskeymarkdown"],
					max_characters: config.maxNoteLength,
					max_media_attachments: 16,
					characters_reserved_per_url: 23,
				},
				media_attachments: {
					supported_mime_types: FILE_TYPE_BROWSERSAFE,
					image_size_limit: 10485760,
					image_matrix_limit: 16777216,
					video_size_limit: 41943040,
					video_frame_rate_limit: 60,
					video_matrix_limit: 2304000,
				},
				polls: {
					max_options: 10,
					max_characters_per_option: 50,
					min_expiration: 50,
					max_expiration: 2629746,
				},
				reactions: {
					max_reactions: 1,
					default_reaction: instanceMeta.defaultReaction,
				},
			},
			contact_account: contact,
			rules: [],
		};

		return awaitAll(res);
	}

	public static async getInstanceV2(
		ctx: MastoContext,
	): Promise<MastodonEntity.InstanceV2> {
		const userCount = await countLocalUsers();
		const contact = await Users.findOne({
			where: {
				host: IsNull(),
				isAdmin: true,
				isDeleted: false,
				isSuspended: false,
			},
			order: { id: "ASC" },
		}).then((p) => (p ? UserConverter.encode(p, ctx) : null));
		const instanceMeta = await fetchMeta();

		const res = {
			domain: config.host,
			title: instanceMeta.name || "Firefish",
			version: `4.2.8 (compatible; Firefish ${config.version})`,
			source_url: instanceMeta.repositoryUrl,
			description:
				instanceMeta.description ||
				"This is a Firefish instance. It doesn’t seem to have a description.",
			usage: {
				users: {
					active_month: userCount,
				},
			},
			thumbnail: {
				url: instanceMeta.bannerUrl || "/static-assets/transparent.png",
			},
			languages: instanceMeta.langs,
			configuration: {
				urls: {
					streaming: `${config.url.replace(/^http(?=s?:\/\/)/, "ws")}`,
				},
				vapid: {
					public_key: instanceMeta.swPublicKey || "",
				},
				accounts: {
					max_featured_tags: 20,
				},
				statuses: {
					max_characters: config.maxNoteLength,
					max_media_attachments: 16,
					characters_reserved_per_url: 23,
				},
				media_attachments: {
					supported_mime_types: FILE_TYPE_BROWSERSAFE,
					image_size_limit: 10485760,
					image_matrix_limit: 16777216,
					video_size_limit: 41943040,
					video_frame_rate_limit: 60,
					video_matrix_limit: 2304000,
				},
				polls: {
					max_options: 10,
					max_characters_per_option: 50,
					min_expiration: 50,
					max_expiration: 2629746,
				},
				translation: {
					enabled: !!(
						instanceMeta.libreTranslateApiKey || instanceMeta.deeplAuthKey
					),
				},
			},
			registrations: {
				enabled: !instanceMeta.disableRegistration,
				approval_required: false,
				message: null,
			},
			contact: {
				email: instanceMeta.maintainerEmail || "",
				account: contact,
			},
			rules: [],
		};

		return awaitAll(res);
	}

	public static async getAnnouncements(
		includeRead = false,
		ctx: MastoContext,
	): Promise<MastodonEntity.Announcement[]> {
		const user = ctx.user as ILocalUser;
		const userProfileLang =
			(await UserProfiles.findOneBy({ userId: user.id }))?.lang ?? undefined;

		if (includeRead) {
			const [announcements, reads] = await Promise.all([
				Announcements.createQueryBuilder("announcement")
					.orderBy({ "announcement.id": "DESC" })
					.getMany(),
				AnnouncementReads.findBy({ userId: user.id }).then((p) =>
					p.map((x) => x.announcementId),
				),
			]);

			return Promise.all(
				announcements.map(async (p) =>
					AnnouncementConverter.encode(
						p,
						reads.includes(p.id),
						userProfileLang,
						ctx,
					),
				),
			);
		}

		const sq = AnnouncementReads.createQueryBuilder("reads")
			.select("reads.announcementId")
			.where("reads.userId = :userId");

		const query = Announcements.createQueryBuilder("announcement")
			.where(`announcement.id NOT IN (${sq.getQuery()})`)
			.orderBy({ "announcement.id": "DESC" })
			.setParameter("userId", user.id);

		return query
			.getMany()
			.then((p) =>
				Promise.all(
					p.map(async (x) =>
						AnnouncementConverter.encode(x, false, userProfileLang, ctx),
					),
				),
			);
	}

	public static async dismissAnnouncement(
		announcement: Announcement,
		ctx: MastoContext,
	): Promise<void> {
		const user = ctx.user as ILocalUser;
		const exists = await AnnouncementReads.exists({
			where: { userId: user.id, announcementId: announcement.id },
		});
		if (!exists) {
			await AnnouncementReads.insert({
				id: genId(),
				createdAt: new Date(),
				userId: user.id,
				announcementId: announcement.id,
			});
		}
	}

	public static async getFollowSuggestions(
		limit: number,
		ctx: MastoContext,
	): Promise<MastodonEntity.SuggestedAccount[]> {
		const user = ctx.user as ILocalUser;
		const results: Promise<MastodonEntity.SuggestedAccount[]>[] = [];

		const pinned = fetchMeta().then((meta) =>
			Promise.all(
				meta.pinnedUsers
					.map((acct) => stringToAcct(acct))
					.map((acct) =>
						Users.findOneBy({
							usernameLower: acct.username.toLowerCase(),
							host: acct.host ?? IsNull(),
						}),
					),
			)
				.then((p) => p.filter((x) => !!x) as User[])
				.then((p) => UserConverter.encodeMany(p, ctx))
				.then((p) =>
					p.map((x) => {
						return {
							source: "staff",
							account: x,
						} as MastodonEntity.SuggestedAccount;
					}),
				),
		);

		const query = Users.createQueryBuilder("user")
			.where("user.isExplorable = TRUE")
			.andWhere("user.host IS NULL")
			.orderBy("user.followersCount", "DESC")
			.andWhere("user.updatedAt > :date", {
				date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
			});

		generateMutedUserQueryForUsers(query, user);
		generateBlockQueryForUsers(query, user);

		const global = query
			.take(limit)
			.getMany()
			.then((p) => UserConverter.encodeMany(p, ctx))
			.then((p) =>
				p.map((x) => {
					return {
						source: "global",
						account: x,
					} as MastodonEntity.SuggestedAccount;
				}),
			);

		results.push(pinned);
		results.push(global);

		return Promise.all(results).then((p) =>
			uniqBy(
				p.flat(),
				(x: MastodonEntity.SuggestedAccount) => x.account.id,
			).slice(0, limit),
		);
	}

	public static async getCustomEmoji() {
		return Emojis.find({
			where: {
				host: IsNull(),
			},
			order: {
				category: "ASC",
				name: "ASC",
			},
			cache: {
				id: "meta_emojis",
				milliseconds: 3600000, // 1 hour
			},
		}).then((dbRes) =>
			populateEmojis(
				dbRes.map((p) => p.name),
				null,
			).then((p) =>
				p
					.map((x) => EmojiConverter.encode(x))
					.map((x) => {
						return {
							...x,
							category:
								dbRes.find((y) => y.name === x.shortcode)?.category ??
								undefined,
						};
					}),
			),
		);
	}

	public static async getTrendingStatuses(
		limit = 20,
		offset = 0,
		ctx: MastoContext,
	): Promise<MastodonEntity.Status[]> {
		if (limit > 40) limit = 40;
		const query = Notes.createQueryBuilder("note")
			.andWhere("note.score > 0")
			.andWhere("note.createdAt > :date", {
				date: new Date(Date.now() - 1000 * 60 * 60 * 24),
			})
			.andWhere("note.visibility = 'public'")
			.andWhere("note.userHost IS NULL")
			.orderBy("note.score", "DESC");

		return query
			.skip(offset)
			.take(limit)
			.getMany()
			.then((result) => NoteConverter.encodeMany(result, ctx));
	}

	public static async getTrendingHashtags(
		limit = 10,
		offset = 0,
	): Promise<MastodonEntity.Tag[]> {
		if (limit > 20) limit = 20;
		return [];
		// FIXME: This was already implemented in api/endpoints/hashtags/trend.ts, but the implementation is sketchy at best. Rewrite from scratch.
	}

	public static getPreferences(
		ctx: MastoContext,
	): Promise<MastodonEntity.Preferences> {
		const user = ctx.user as ILocalUser;
		const profile = UserProfiles.findOneByOrFail({ userId: user.id });
		const sensitive = profile.then((p) => p.alwaysMarkNsfw);
		const language = profile.then((p) => p.lang);
		const privacy = UserHelpers.getDefaultNoteVisibility(ctx).then((p) =>
			VisibilityConverter.encode(p),
		);

		const res = {
			"posting:default:visibility": privacy,
			"posting:default:sensitive": sensitive,
			"posting:default:language": language,
			"reading:expand:media": "default" as const, // FIXME: see below
			"reading:expand:spoilers": false, // FIXME: store this on server instead of client
		};

		return awaitAll(res);
	}
}
