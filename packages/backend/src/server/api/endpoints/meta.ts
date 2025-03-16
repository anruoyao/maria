import JSON5 from "json5";
import { IsNull, MoreThan } from "typeorm";
import { config } from "@/config.js";
import { countLocalUsers, fetchMeta } from "backend-rs";
import { Ads, Emojis, Users } from "@/models/index.js";
import define from "@/server/api/define.js";

export const meta = {
	tags: ["meta"],

	requireCredential: false,

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			maintainerName: {
				type: "string",
				optional: false,
				nullable: true,
			},
			maintainerEmail: {
				type: "string",
				optional: false,
				nullable: true,
			},
			version: {
				type: "string",
				optional: false,
				nullable: false,
				example: config.version,
			},
			name: {
				type: "string",
				optional: false,
				nullable: false,
			},
			uri: {
				type: "string",
				optional: false,
				nullable: false,
				format: "url",
				example: "https://firefish.example.com",
			},
			description: {
				type: "string",
				optional: false,
				nullable: true,
			},
			langs: {
				type: "array",
				optional: false,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			tosUrl: {
				type: "string",
				optional: false,
				nullable: true,
			},
			moreUrls: {
				type: "object",
				optional: false,
				nullable: false,
			},
			repositoryUrl: {
				type: "string",
				optional: false,
				nullable: false,
				default: "https://firefish.dev/firefish/firefish",
			},
			feedbackUrl: {
				type: "string",
				optional: false,
				nullable: false,
				default: "https://firefish.dev/firefish/firefish/issues",
			},
			defaultDarkTheme: {
				type: "string",
				optional: false,
				nullable: true,
			},
			defaultLightTheme: {
				type: "string",
				optional: false,
				nullable: true,
			},
			disableRegistration: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			disableLocalTimeline: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			disableRecommendedTimeline: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			disableGlobalTimeline: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			enableGuestTimeline: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			driveCapacityPerLocalUserMb: {
				type: "number",
				optional: false,
				nullable: false,
			},
			driveCapacityPerRemoteUserMb: {
				type: "number",
				optional: false,
				nullable: false,
			},
			antennaLimit: {
				type: "number",
				optional: false,
				nullable: false,
			},
			cacheRemoteFiles: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			markLocalFilesNsfwByDefault: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			emailRequiredForSignup: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			enableHcaptcha: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			hcaptchaSiteKey: {
				type: "string",
				optional: false,
				nullable: true,
			},
			enableRecaptcha: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			recaptchaSiteKey: {
				type: "string",
				optional: false,
				nullable: true,
			},
			swPublickey: {
				type: "string",
				optional: false,
				nullable: true,
			},
			mascotImageUrl: {
				type: "string",
				optional: false,
				nullable: false,
				default: "/static-assets/badges/info.webp",
			},
			bannerUrl: {
				type: "string",
				optional: false,
				nullable: false,
			},
			errorImageUrl: {
				type: "string",
				optional: false,
				nullable: false,
				default: "/static-assets/badges/error.webp",
			},
			iconUrl: {
				type: "string",
				optional: false,
				nullable: true,
			},
			maxNoteTextLength: {
				type: "number",
				optional: false,
				nullable: false,
			},
			maxCaptionTextLength: {
				type: "number",
				optional: false,
				nullable: false,
			},
			emojis: {
				type: "array",
				optional: false,
				nullable: false,
				items: {
					type: "object",
					optional: false,
					nullable: false,
					properties: {
						id: {
							type: "string",
							optional: false,
							nullable: false,
							format: "id",
						},
						aliases: {
							type: "array",
							optional: false,
							nullable: false,
							items: {
								type: "string",
								optional: false,
								nullable: false,
							},
						},
						category: {
							type: "string",
							optional: false,
							nullable: true,
						},
						host: {
							type: "string",
							optional: false,
							nullable: true,
							description: "The local host is represented with `null`.",
						},
						url: {
							type: "string",
							optional: false,
							nullable: false,
							format: "url",
						},
					},
				},
			},
			ads: {
				type: "array",
				optional: false,
				nullable: false,
				items: {
					type: "object",
					optional: false,
					nullable: false,
					properties: {
						place: {
							type: "string",
							optional: false,
							nullable: false,
						},
						url: {
							type: "string",
							optional: false,
							nullable: false,
							format: "url",
						},
						imageUrl: {
							type: "string",
							optional: false,
							nullable: false,
							format: "url",
						},
					},
				},
			},
			requireSetup: {
				type: "boolean",
				optional: false,
				nullable: false,
				example: false,
			},
			enableEmail: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			enableServiceWorker: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			translatorAvailable: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			proxyAccountName: {
				type: "string",
				optional: false,
				nullable: true,
			},
			features: {
				type: "object",
				optional: true,
				nullable: false,
				properties: {
					registration: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					localTimeLine: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					recommendedTimeLine: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					globalTimeLine: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					searchFilters: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					hcaptcha: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					recaptcha: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					objectStorage: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					serviceWorker: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					miauth: {
						type: "boolean",
						optional: true,
						nullable: false,
						default: true,
					},
				},
			},
			secureMode: {
				type: "boolean",
				optional: true,
				nullable: false,
				default: false,
			},
			privateMode: {
				type: "boolean",
				optional: true,
				nullable: false,
				default: false,
			},
			defaultReaction: {
				type: "string",
				optional: "false",
				nullable: false,
				default: "⭐",
			},
			donationLink: {
				type: "string",
				optional: "true",
				nullable: true,
			},
			enableServerMachineStats: {
				type: "boolean",
				optional: "true",
				nullable: false,
				default: false,
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		detail: { type: "boolean", default: true },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const instanceMeta = await fetchMeta();

	const emojis = await Emojis.find({
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
	});

	const ads = await Ads.find({
		where: {
			expiresAt: MoreThan(new Date()),
		},
	});

	const response: any = {
		maintainerName: instanceMeta.maintainerName,
		maintainerEmail: instanceMeta.maintainerEmail,

		version: config.version,

		name: instanceMeta.name,
		uri: config.url,
		description: instanceMeta.description,
		langs: instanceMeta.langs,
		tosUrl: instanceMeta.tosUrl,
		moreUrls: instanceMeta.moreUrls,
		repositoryUrl: instanceMeta.repositoryUrl,
		feedbackUrl: instanceMeta.feedbackUrl,

		secureMode: instanceMeta.secureMode,
		privateMode: instanceMeta.privateMode,

		disableRegistration: instanceMeta.disableRegistration,
		disableLocalTimeline: instanceMeta.disableLocalTimeline,
		disableRecommendedTimeline: instanceMeta.disableRecommendedTimeline,
		disableGlobalTimeline: instanceMeta.disableGlobalTimeline,
		enableGuestTimeline: instanceMeta.enableGuestTimeline,
		driveCapacityPerLocalUserMb: instanceMeta.localDriveCapacityMb,
		driveCapacityPerRemoteUserMb: instanceMeta.remoteDriveCapacityMb,
		antennaLimit: instanceMeta.antennaLimit,
		emailRequiredForSignup: instanceMeta.emailRequiredForSignup,
		enableHcaptcha: instanceMeta.enableHcaptcha,
		hcaptchaSiteKey: instanceMeta.hcaptchaSiteKey,
		enableRecaptcha: instanceMeta.enableRecaptcha,
		recaptchaSiteKey: instanceMeta.recaptchaSiteKey,
		swPublickey: instanceMeta.swPublicKey,
		themeColor: instanceMeta.themeColor,
		mascotImageUrl: instanceMeta.mascotImageUrl,
		bannerUrl: instanceMeta.bannerUrl,
		errorImageUrl: instanceMeta.errorImageUrl,
		iconUrl: instanceMeta.iconUrl,
		backgroundImageUrl: instanceMeta.backgroundImageUrl,
		logoImageUrl: instanceMeta.logoImageUrl,
		maxNoteTextLength: config.maxNoteLength, // for backward compatibility
		maxCaptionTextLength: config.maxCaptionLength,
		emojis:
			instanceMeta.privateMode && !me ? [] : await Emojis.packMany(emojis),
		// クライアントの手間を減らすためあらかじめJSONに変換しておく
		defaultLightTheme: instanceMeta.defaultLightTheme
			? JSON.stringify(JSON5.parse(instanceMeta.defaultLightTheme))
			: null,
		defaultDarkTheme: instanceMeta.defaultDarkTheme
			? JSON.stringify(JSON5.parse(instanceMeta.defaultDarkTheme))
			: null,
		ads:
			instanceMeta.privateMode && !me
				? []
				: ads.map((ad) => ({
						id: ad.id,
						url: ad.url,
						place: ad.place,
						ratio: ad.ratio,
						imageUrl: ad.imageUrl,
					})),
		enableEmail: instanceMeta.enableEmail,

		enableServiceWorker: instanceMeta.enableServiceWorker,

		translatorAvailable:
			instanceMeta.deeplAuthKey != null ||
			instanceMeta.libreTranslateApiUrl != null,
		defaultReaction: instanceMeta.defaultReaction,
		donationLink: instanceMeta.donationLink,
		enableServerMachineStats: instanceMeta.enableServerMachineStats,
		enableIdenticonGeneration: instanceMeta.enableIdenticonGeneration,

		...(ps.detail
			? {
					pinnedPages:
						instanceMeta.privateMode && !me ? [] : instanceMeta.pinnedPages,
					pinnedClipId:
						instanceMeta.privateMode && !me ? [] : instanceMeta.pinnedClipId,
					cacheRemoteFiles: instanceMeta.cacheRemoteFiles,
					markLocalFilesNsfwByDefault: instanceMeta.markLocalFilesNsfwByDefault,
					requireSetup: (await countLocalUsers()) === 0,
				}
			: {}),
	};

	if (ps.detail) {
		if (!instanceMeta.privateMode || me) {
			const proxyAccount = instanceMeta.proxyAccountId
				? await Users.pack(instanceMeta.proxyAccountId).catch(() => null)
				: null;
			response.proxyAccountName = proxyAccount ? proxyAccount.username : null;
		}

		response.features = {
			registration: !instanceMeta.disableRegistration,
			localTimeLine: !instanceMeta.disableLocalTimeline,
			recommendedTimeline: !instanceMeta.disableRecommendedTimeline,
			globalTimeLine: !instanceMeta.disableGlobalTimeline,
			guestTimeline: instanceMeta.enableGuestTimeline,
			emailRequiredForSignup: instanceMeta.emailRequiredForSignup,
			hcaptcha: instanceMeta.enableHcaptcha,
			recaptcha: instanceMeta.enableRecaptcha,
			objectStorage: instanceMeta.useObjectStorage,
			serviceWorker: instanceMeta.enableServiceWorker,
			postEditing: true,
			postImports: instanceMeta.experimentalFeatures?.postImports || false,
			miauth: true,
		};
	}

	return response;
});
