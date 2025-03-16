import type { entities } from "firefish-js";
import { computed } from "vue";
import { api } from "./os";
import { set, get } from "idb-keyval";

// TODO: 他のタブと永続化されたstateを同期

// TODO: fallback to defaults more nicely (with #10947)
// default values
let instanceMeta: entities.DetailedInstanceMetadata = {
	maintainerName: "",
	maintainerEmail: "",
	version: "",
	name: null,
	uri: "",
	tosUrl: null,
	description: null,
	disableRegistration: true,
	disableLocalTimeline: false,
	disableGlobalTimeline: false,
	disableRecommendedTimeline: true,
	enableGuestTimeline: false,
	driveCapacityPerLocalUserMb: 1000,
	driveCapacityPerRemoteUserMb: 0,
	antennaLimit: 5,
	enableHcaptcha: false,
	hcaptchaSiteKey: null,
	enableRecaptcha: false,
	recaptchaSiteKey: null,
	swPublickey: null,
	maxNoteTextLength: 3000,
	maxCaptionTextLength: 1500,
	enableEmail: false,
	enableServiceWorker: false,
	markLocalFilesNsfwByDefault: false,
	emojis: [],
	ads: [],
	langs: [],
	moreUrls: [],
	repositoryUrl: "https://codeberg.org/firefish/firefish",
	feedbackUrl: "https://codeberg.org/firefish/firefish/-/issues",
	defaultDarkTheme: null,
	defaultLightTheme: null,
	defaultReaction: "⭐",
	cacheRemoteFiles: false,
	proxyAccountName: null,
	emailRequiredForSignup: false,
	mascotImageUrl: "",
	bannerUrl: "",
	backgroundImageUrl: "",
	errorImageUrl: "",
	iconUrl: null,
	requireSetup: false,
	translatorAvailable: false,
	features: {
		registration: false,
		localTimeLine: true,
		recommendedTimeLine: false,
		globalTimeLine: true,
		searchFilters: true,
		hcaptcha: false,
		recaptcha: false,
		objectStorage: false,
		serviceWorker: false,
	},
};

// get("instanceMeta") requires top-level await
export function getInstanceInfo(): entities.DetailedInstanceMetadata {
	return instanceMeta;
}

export async function initializeInstanceCache(): Promise<void> {
	// Is the data stored in IndexDB?
	const fromIdb = await get<string>("instanceMeta");
	if (fromIdb != null) {
		instanceMeta = JSON.parse(fromIdb);
	}
	// Call API
	updateInstanceCache();
}

export async function updateInstanceCache(): Promise<void> {
	const meta = await api("meta", {
		detail: true,
	});

	for (const [k, v] of Object.entries(meta)) {
		instanceMeta[k] = v;
	}
	set("instanceMeta", JSON.stringify(instanceMeta));
}

export const emojiCategories = computed(() => {
	if (instanceMeta.emojis == null) return [];
	const categories = new Set();
	for (const emoji of instanceMeta.emojis) {
		categories.add(emoji.category);
	}
	return Array.from(categories);
});

export const emojiTags = computed(() => {
	if (instanceMeta.emojis == null) return [];
	const tags = new Set();
	for (const emoji of instanceMeta.emojis) {
		for (const tag of emoji.aliases) {
			tags.add(tag);
		}
	}
	return Array.from(tags);
});
