import { config } from "@/config.js";
import { fetchMeta } from "backend-rs";
import define from "@/server/api/define.js";

export const meta = {
	tags: ["meta"],

	requireCredential: true,
	requireAdmin: true,

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
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
			recommendedInstances: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			pinnedUsers: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			customMOTD: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			customSplashIcons: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			hiddenTags: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			blockedHosts: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			silencedHosts: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			allowedHosts: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			privateMode: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			secureMode: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			hcaptchaSecretKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			recaptchaSecretKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			sensitiveMediaDetection: {
				type: "string",
				optional: true,
				nullable: false,
			},
			sensitiveMediaDetectionSensitivity: {
				type: "string",
				optional: true,
				nullable: false,
			},
			setSensitiveFlagAutomatically: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			enableSensitiveMediaDetectionForVideos: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			proxyAccountId: {
				type: "string",
				optional: true,
				nullable: true,
				format: "id",
			},
			summaryProxy: {
				type: "string",
				optional: true,
				nullable: true,
			},
			email: {
				type: "string",
				optional: true,
				nullable: true,
			},
			smtpSecure: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			smtpHost: {
				type: "string",
				optional: true,
				nullable: true,
			},
			smtpPort: {
				type: "string",
				optional: true,
				nullable: true,
			},
			smtpUser: {
				type: "string",
				optional: true,
				nullable: true,
			},
			smtpPass: {
				type: "string",
				optional: true,
				nullable: true,
			},
			swPrivateKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			useObjectStorage: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			objectStorageBaseUrl: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageBucket: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStoragePrefix: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageEndpoint: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageRegion: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStoragePort: {
				type: "number",
				optional: true,
				nullable: true,
			},
			objectStorageAccessKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageSecretKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageUseSSL: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			objectStorageUseProxy: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			objectStorageSetPublicRead: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			enableIpLogging: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			enableActiveEmailValidation: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			defaultReaction: {
				type: "string",
				optional: false,
				nullable: false,
			},
			experimentalFeatures: {
				type: "object",
				optional: true,
				nullable: true,
				properties: {
					postImports: {
						type: "boolean",
					},
				},
			},
			enableServerMachineStats: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			enableIdenticonGeneration: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			donationLink: {
				type: "string",
				optional: true,
				nullable: true,
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	const instanceMeta = await fetchMeta();

	return {
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
		defaultLightTheme: instanceMeta.defaultLightTheme,
		defaultDarkTheme: instanceMeta.defaultDarkTheme,
		enableEmail: instanceMeta.enableEmail,
		enableServiceWorker: instanceMeta.enableServiceWorker,
		translatorAvailable:
			instanceMeta.deeplAuthKey != null ||
			instanceMeta.libreTranslateApiUrl != null,
		pinnedPages: instanceMeta.pinnedPages,
		pinnedClipId: instanceMeta.pinnedClipId,
		cacheRemoteFiles: instanceMeta.cacheRemoteFiles,
		markLocalFilesNsfwByDefault: instanceMeta.markLocalFilesNsfwByDefault,
		defaultReaction: instanceMeta.defaultReaction,
		recommendedInstances: instanceMeta.recommendedInstances,
		pinnedUsers: instanceMeta.pinnedUsers,
		customMOTD: instanceMeta.customMotd,
		customSplashIcons: instanceMeta.customSplashIcons,
		hiddenTags: instanceMeta.hiddenTags,
		blockedHosts: instanceMeta.blockedHosts,
		silencedHosts: instanceMeta.silencedHosts,
		allowedHosts: instanceMeta.allowedHosts,
		privateMode: instanceMeta.privateMode,
		secureMode: instanceMeta.secureMode,
		hcaptchaSecretKey: instanceMeta.hcaptchaSecretKey,
		recaptchaSecretKey: instanceMeta.recaptchaSecretKey,
		proxyAccountId: instanceMeta.proxyAccountId,
		summalyProxy: instanceMeta.summalyProxy,
		email: instanceMeta.email,
		smtpSecure: instanceMeta.smtpSecure,
		smtpHost: instanceMeta.smtpHost,
		smtpPort: instanceMeta.smtpPort,
		smtpUser: instanceMeta.smtpUser,
		smtpPass: instanceMeta.smtpPass,
		swPrivateKey: instanceMeta.swPrivateKey,
		useObjectStorage: instanceMeta.useObjectStorage,
		objectStorageBaseUrl: instanceMeta.objectStorageBaseUrl,
		objectStorageBucket: instanceMeta.objectStorageBucket,
		objectStoragePrefix: instanceMeta.objectStoragePrefix,
		objectStorageEndpoint: instanceMeta.objectStorageEndpoint,
		objectStorageRegion: instanceMeta.objectStorageRegion,
		objectStoragePort: instanceMeta.objectStoragePort,
		objectStorageAccessKey: instanceMeta.objectStorageAccessKey,
		objectStorageSecretKey: instanceMeta.objectStorageSecretKey,
		objectStorageUseSSL: instanceMeta.objectStorageUseSsl,
		objectStorageUseProxy: instanceMeta.objectStorageUseProxy,
		objectStorageSetPublicRead: instanceMeta.objectStorageSetPublicRead,
		objectStorageS3ForcePathStyle: instanceMeta.objectStorageS3ForcePathStyle,
		deeplAuthKey: instanceMeta.deeplAuthKey,
		deeplIsPro: instanceMeta.deeplIsPro,
		libreTranslateApiUrl: instanceMeta.libreTranslateApiUrl,
		libreTranslateApiKey: instanceMeta.libreTranslateApiKey,
		enableIpLogging: instanceMeta.enableIpLogging,
		enableActiveEmailValidation: instanceMeta.enableActiveEmailValidation,
		experimentalFeatures: instanceMeta.experimentalFeatures,
		enableServerMachineStats: instanceMeta.enableServerMachineStats,
		enableIdenticonGeneration: instanceMeta.enableIdenticonGeneration,
		donationLink: instanceMeta.donationLink,
	};
});
