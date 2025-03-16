import * as mfm from "mfm-js";
import {
	Event,
	publishToMainStream,
	publishToUserStream,
	UserEvent,
} from "backend-rs";
import acceptAllFollowRequests from "@/services/following/requests/accept-all.js";
import { publishToFollowers } from "@/services/i/update.js";
import { extractCustomEmojisFromMfm } from "@/misc/extract-custom-emojis-from-mfm.js";
import { extractHashtags } from "@/misc/extract-hashtags.js";
import { updateUsertags } from "@/services/update-hashtag.js";
import { Users, DriveFiles, UserProfiles, Pages } from "@/models/index.js";
import type { User } from "@/models/entities/user.js";
import type { UserProfile } from "@/models/entities/user-profile.js";
import { notificationTypes } from "@/types.js";
import { normalizeForSearch } from "@/misc/normalize-for-search.js";
import { verifyLink } from "@/services/fetch-rel-me.js";
import { ApiError } from "@/server/api/error.js";
import define from "@/server/api/define.js";
import type { DriveFile } from "@/models/entities/drive-file";

export const meta = {
	tags: ["account"],

	requireCredential: true,

	kind: "write:account",

	errors: {
		noSuchAvatar: {
			message: "No such avatar file.",
			code: "NO_SUCH_AVATAR",
			id: "539f3a45-f215-4f81-a9a8-31293640207f",
		},

		noSuchBanner: {
			message: "No such banner file.",
			code: "NO_SUCH_BANNER",
			id: "0d8f5629-f210-41c2-9433-735831a58595",
		},

		avatarNotAnImage: {
			message: "The file specified as an avatar is not an image.",
			code: "AVATAR_NOT_AN_IMAGE",
			id: "f419f9f8-2f4d-46b1-9fb4-49d3a2fd7191",
		},

		bannerNotAnImage: {
			message: "The file specified as a banner is not an image.",
			code: "BANNER_NOT_AN_IMAGE",
			id: "75aedb19-2afd-4e6d-87fc-67941256fa60",
		},

		noSuchPage: {
			message: "No such page.",
			code: "NO_SUCH_PAGE",
			id: "8e01b590-7eb9-431b-a239-860e086c408e",
		},

		invalidRegexp: {
			message: "Invalid Regular Expression.",
			code: "INVALID_REGEXP",
			id: "0d786918-10df-41cd-8f33-8dec7d9a89a5",
		},

		invalidFieldName: {
			message: "Invalid field name.",
			code: "INVALID_FIELD_NAME",
			id: "8f81972e-8b53-4d30-b0d2-efb026dda673",
		},

		invalidFieldValue: {
			message: "Invalid field value.",
			code: "INVALID_FIELD_VALUE",
			id: "aede7444-244b-11ee-be56-0242ac120002",
		},
	},

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "MeDetailed",
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		name: { ...Users.nameSchema, nullable: true },
		description: { ...Users.descriptionSchema, nullable: true },
		location: { ...Users.locationSchema, nullable: true },
		birthday: { ...Users.birthdaySchema, nullable: true },
		lang: { type: "string", nullable: true },
		avatarId: { type: "string", format: "misskey:id", nullable: true },
		bannerId: { type: "string", format: "misskey:id", nullable: true },
		fields: {
			type: "array",
			minItems: 0,
			maxItems: 16,
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					value: { type: "string" },
				},
				required: ["name", "value"],
			},
		},
		isLocked: { type: "boolean" },
		isExplorable: { type: "boolean" },
		hideOnlineStatus: { type: "boolean" },
		publicReactions: { type: "boolean" },
		carefulBot: { type: "boolean" },
		autoAcceptFollowed: { type: "boolean" },
		noCrawle: { type: "boolean" },
		preventAiLearning: { type: "boolean" },
		isBot: { type: "boolean" },
		isCat: { type: "boolean" },
		speakAsCat: { type: "boolean", nullable: true },
		readCatLanguage: { type: "boolean", nullable: true },
		isIndexable: { type: "boolean" },
		injectFeaturedNote: { type: "boolean" },
		receiveAnnouncementEmail: { type: "boolean" },
		alwaysMarkNsfw: { type: "boolean" },
		ffVisibility: { type: "string", enum: ["public", "followers", "private"] },
		pinnedPageId: { type: "string", format: "misskey:id", nullable: true },
		mutedWords: { type: "array" },
		mutedPatterns: { type: "array", items: { type: "string" } },
		mutedInstances: {
			type: "array",
			items: {
				type: "string",
			},
		},
		mutingNotificationTypes: {
			type: "array",
			items: {
				type: "string",
				enum: notificationTypes,
			},
		},
		emailNotificationTypes: {
			type: "array",
			items: {
				type: "string",
			},
		},
	},
} as const;

export default define(meta, paramDef, async (ps, _user, token) => {
	const user = await Users.findOneByOrFail({ id: _user.id });
	const isSecure = token == null;

	const updates = {} as Partial<User>;
	const profileUpdates = {} as Partial<UserProfile>;

	const profile = await UserProfiles.findOneByOrFail({ userId: user.id });

	if (ps.name !== undefined) updates.name = ps.name;
	if (ps.description !== undefined) profileUpdates.description = ps.description;
	if (typeof ps.lang === "string") profileUpdates.lang = ps.lang;
	if (ps.location !== undefined) profileUpdates.location = ps.location;
	if (ps.birthday !== undefined) profileUpdates.birthday = ps.birthday;
	if (ps.ffVisibility !== undefined)
		profileUpdates.ffVisibility = ps.ffVisibility;
	if (ps.avatarId !== undefined) updates.avatarId = ps.avatarId;
	if (ps.bannerId !== undefined) updates.bannerId = ps.bannerId;
	if (ps.mutedPatterns !== undefined) {
		for (const item of ps.mutedPatterns) {
			const regexp = item.match(/^\/(.+)\/(.*)$/);
			if (!regexp) throw new ApiError(meta.errors.invalidRegexp);

			try {
				new RegExp(regexp[1], regexp[2]);
			} catch (err) {
				throw new ApiError(meta.errors.invalidRegexp);
			}

			profileUpdates.mutedPatterns = profileUpdates.mutedPatterns ?? [];
			profileUpdates.mutedPatterns.push(item);
		}
	}
	if (ps.mutedWords !== undefined) {
		const flatten = (arr: string[][]) =>
			JSON.stringify(arr) === "[[]]"
				? ([] as string[])
				: arr.map((row) => row.join(" "));
		profileUpdates.mutedWords = flatten(ps.mutedWords);
	}
	if (
		profileUpdates.mutedWords !== undefined ||
		profileUpdates.mutedPatterns !== undefined
	) {
		profileUpdates.enableWordMute =
			(profileUpdates.mutedWords != null &&
				profileUpdates.mutedWords.length > 0) ||
			(profileUpdates.mutedPatterns != null &&
				profileUpdates.mutedPatterns.length > 0);
	}
	if (ps.mutedInstances !== undefined)
		profileUpdates.mutedInstances = ps.mutedInstances;
	if (ps.mutingNotificationTypes !== undefined)
		profileUpdates.mutingNotificationTypes =
			ps.mutingNotificationTypes as (typeof notificationTypes)[number][];
	if (typeof ps.isLocked === "boolean") updates.isLocked = ps.isLocked;
	if (typeof ps.isExplorable === "boolean")
		updates.isExplorable = ps.isExplorable;
	if (typeof ps.hideOnlineStatus === "boolean")
		updates.hideOnlineStatus = ps.hideOnlineStatus;
	if (typeof ps.publicReactions === "boolean")
		profileUpdates.publicReactions = ps.publicReactions;
	if (typeof ps.isBot === "boolean") updates.isBot = ps.isBot;
	if (typeof ps.carefulBot === "boolean")
		profileUpdates.carefulBot = ps.carefulBot;
	if (typeof ps.autoAcceptFollowed === "boolean")
		profileUpdates.autoAcceptFollowed = ps.autoAcceptFollowed;
	if (typeof ps.noCrawle === "boolean") profileUpdates.noCrawle = ps.noCrawle;
	if (typeof ps.preventAiLearning === "boolean")
		profileUpdates.preventAiLearning = ps.preventAiLearning;
	if (typeof ps.isCat === "boolean") updates.isCat = ps.isCat;
	if (typeof ps.isIndexable === "boolean") {
		updates.isIndexable = ps.isIndexable;
		profileUpdates.isIndexable = ps.isIndexable;
	}
	if (typeof ps.speakAsCat === "boolean") updates.speakAsCat = ps.speakAsCat;
	if (typeof ps.readCatLanguage === "boolean")
		updates.readCatLanguage = ps.readCatLanguage;
	if (typeof ps.injectFeaturedNote === "boolean")
		profileUpdates.injectFeaturedNote = ps.injectFeaturedNote;
	if (typeof ps.receiveAnnouncementEmail === "boolean")
		profileUpdates.receiveAnnouncementEmail = ps.receiveAnnouncementEmail;
	if (typeof ps.alwaysMarkNsfw === "boolean")
		profileUpdates.alwaysMarkNsfw = ps.alwaysMarkNsfw;
	if (ps.emailNotificationTypes !== undefined)
		profileUpdates.emailNotificationTypes = ps.emailNotificationTypes;

	let avatar: DriveFile | null = null;
	if (ps.avatarId) {
		avatar = await DriveFiles.findOneBy({ id: ps.avatarId });

		if (avatar == null || avatar.userId !== user.id)
			throw new ApiError(meta.errors.noSuchAvatar);
		if (!avatar.type.startsWith("image/"))
			throw new ApiError(meta.errors.avatarNotAnImage);
	}

	let banner: DriveFile | null = null;
	if (ps.bannerId) {
		banner = await DriveFiles.findOneBy({ id: ps.bannerId });

		if (banner == null || banner.userId !== user.id)
			throw new ApiError(meta.errors.noSuchBanner);
		if (!banner.type.startsWith("image/"))
			throw new ApiError(meta.errors.bannerNotAnImage);
	}

	if (ps.pinnedPageId) {
		const page = await Pages.findOneBy({ id: ps.pinnedPageId });

		if (page == null || page.userId !== user.id)
			throw new ApiError(meta.errors.noSuchPage);

		profileUpdates.pinnedPageId = page.id;
	} else if (ps.pinnedPageId === null) {
		profileUpdates.pinnedPageId = null;
	}

	if (ps.fields) {
		for (const field of ps.fields) {
			if (!field || field.name === "" || field.value === "") {
				continue;
			}
			if (typeof field.name !== "string" || field.name === "") {
				throw new ApiError(meta.errors.invalidFieldName);
			}
			if (typeof field.value !== "string" || field.value === "") {
				throw new ApiError(meta.errors.invalidFieldValue);
			}
			if (field.value.startsWith("http")) {
				field.verified = await verifyLink(field.value, user.username);
			}
		}

		profileUpdates.fields = ps.fields
			.filter((x) => Object.keys(x).length !== 0)
			.map((x) => {
				return {
					name: x.name,
					value: x.value,
					verified: x.verified,
				};
			});
	}

	//#region emojis/tags

	let emojis = [] as string[];
	let tags = [] as string[];

	const newName = updates.name === undefined ? user.name : updates.name;
	const newDescription =
		profileUpdates.description === undefined
			? profile.description
			: profileUpdates.description;

	if (newName != null) {
		const tokens = mfm.parseSimple(newName);
		emojis = emojis.concat(extractCustomEmojisFromMfm(tokens!));
	}

	if (newDescription != null) {
		const tokens = mfm.parse(newDescription);
		emojis = emojis.concat(extractCustomEmojisFromMfm(tokens!));
		tags = extractHashtags(tokens!)
			.map((tag) => normalizeForSearch(tag))
			.splice(0, 32);
	}

	updates.emojis = emojis;
	updates.tags = tags;

	// ハッシュタグ更新
	updateUsertags(user, tags);
	//#endregion

	// Update old/new avatar usage hints
	if (avatar) {
		if (user.avatarId)
			await DriveFiles.update(user.avatarId, { usageHint: null });
		await DriveFiles.update(avatar.id, { usageHint: "userAvatar" });
	}

	// Update old/new banner usage hints
	if (banner) {
		if (user.bannerId)
			await DriveFiles.update(user.bannerId, { usageHint: null });
		await DriveFiles.update(banner.id, { usageHint: "userBanner" });
	}

	if (Object.keys(updates).length > 0) await Users.update(user.id, updates);
	if (Object.keys(profileUpdates).length > 0)
		await UserProfiles.update(user.id, profileUpdates);

	const iObj = await Users.pack<true, true>(user.id, user, {
		detail: true,
		includeSecrets: isSecure,
	});

	// Publish meUpdated event
	await publishToMainStream(user.id, Event.Me, iObj);
	await publishToUserStream(
		user.id,
		UserEvent.UpdateProfile,
		await UserProfiles.findOneBy({ userId: user.id }),
	);

	// 鍵垢を解除したとき、溜まっていたフォローリクエストがあるならすべて承認
	if (user.isLocked && ps.isLocked === false) {
		await acceptAllFollowRequests(user);
	}

	// フォロワーにUpdateを配信
	await publishToFollowers(user.id);

	return iObj;
});
