import { markRaw } from "vue";
import type { ApiTypes, entities } from "firefish-js";
import { isSignedIn, me } from "./me";
import { Storage } from "./pizzax";
import type { NoteVisibility } from "@/types/note";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type TODO = any;

export const postFormActions: {
	title: string;
	handler: (from, update) => void | Promise<void>;
}[] = [];
export const userActions: {
	title: string;
	handler: (user: entities.User) => void | Promise<void>;
}[] = [];
export const noteActions: {
	title: string;
	handler: (note: entities.Note) => void | Promise<void>;
}[] = [];
export const noteViewInterruptors: {
	handler: (note: entities.Note) => Promise<entities.Note>;
}[] = [];
export const notePostInterruptors: {
	handler: (note: ApiTypes.NoteSubmitReq) => Promise<ApiTypes.NoteSubmitReq>;
}[] = [];

const menuOptions = [
	"notifications",
	"followRequests",
	"messaging",
	"explore",
	"favorites",
	"channels",
	"search",
];

export const defaultReactions = [
	"⭐",
	"❤️",
	"😆",
	"🤔",
	"😮",
	"🎉",
	"💢",
	"😥",
	"😇",
	"🥴",
	"🔥",
	"🐟",
];

// TODO: それぞれいちいちwhereとかdefaultというキーを付けなきゃいけないの冗長なのでなんとかする(ただ型定義が面倒になりそう)
//       あと、現行の定義の仕方なら「whereが何であるかに関わらずキー名の重複不可」という制約を付けられるメリットもあるからそのメリットを引き継ぐ方法も考えないといけない
export const defaultStore = markRaw(
	new Storage("base", {
		tutorial: {
			where: "account",
			default: 0,
		},
		tlHomeHintClosed: {
			where: "account",
			default: false,
		},
		tlLocalHintClosed: {
			where: "account",
			default: false,
		},
		tlRecommendedHintClosed: {
			where: "account",
			default: false,
		},
		tlSocialHintClosed: {
			where: "account",
			default: false,
		},
		tlGlobalHintClosed: {
			where: "account",
			default: false,
		},
		keepCw: {
			where: "account",
			default: true,
		},
		showFullAcct: {
			where: "account",
			default: false,
		},
		rememberNoteVisibility: {
			where: "account",
			default: false,
		},
		defaultNoteVisibility: {
			where: "account",
			default: "public" as NoteVisibility,
		},
		defaultNoteLocalOnly: {
			where: "account",
			default: false,
		},
		uploadFolder: {
			where: "account",
			default: null as string | null,
		},
		pastedFileName: {
			where: "account",
			default: "yyyy-MM-dd HH-mm-ss [{{number}}]",
		},
		keepOriginalUploading: {
			where: "account",
			default: false,
		},
		memo: {
			where: "account",
			default: null,
		},
		reactions: {
			where: "account",
			default: defaultReactions,
		},
		mutedWords: {
			where: "account",
			default: [],
		},
		mutedLangs: {
			where: "account",
			default: [],
		},
		mutedAds: {
			where: "account",
			default: [] as string[],
		},
		showAds: {
			where: "account",
			default: true,
		},
		menu: {
			where: "deviceAccount",
			default: menuOptions,
		},
		visibility: {
			where: "deviceAccount",
			default: "public" as NoteVisibility,
		},
		localOnly: {
			where: "deviceAccount",
			default: false,
		},
		statusbars: {
			where: "deviceAccount",
			default: [] as {
				name: string;
				id: string;
				type: string;
				size: "verySmall" | "small" | "medium" | "large" | "veryLarge";
				black: boolean;
				props: Record<string, TODO>;
			}[],
		},
		widgets: {
			where: "deviceAccount",
			default: [] as {
				name: string;
				id: string;
				place: string | null;
				data: Record<string, TODO>;
			}[],
		},
		tl: {
			where: "deviceAccount",
			default: {
				src: (isSignedIn(me) ? "home" : "local") as
					| "home"
					| "local"
					| "social"
					| "global"
					| "recommended",
				arg: null,
			},
		},

		overridedDeviceKind: {
			where: "device",
			default: null as null | "smartphone" | "tablet" | "desktop",
		},
		serverDisconnectedBehavior: {
			where: "device",
			default: "nothing" as "nothing" | "quiet" | "reload" | "dialog",
		},
		seperateRenoteQuote: {
			where: "device",
			default: true,
		},
		expandOnNoteClick: {
			where: "device",
			default: true,
		},
		nsfw: {
			where: "deviceAccount",
			default: "respect" as "respect" | "force" | "ignore",
		},
		animation: {
			where: "device",
			default: true,
		},
		advancedMfm: {
			where: "device",
			default: true,
		},
		animatedMfm: {
			where: "device",
			default: true,
		},
		animatedMfmWarnShown: {
			where: "device",
			default: false,
		},
		loadRawImages: {
			where: "device",
			default: false,
		},
		imageNewTab: {
			where: "device",
			default: false,
		},
		disableShowingAnimatedImages: {
			where: "device",
			default: false,
		},
		disablePagesScript: {
			where: "device",
			default: false,
		},
		useOsNativeEmojis: {
			where: "device",
			default: false,
		},
		disableDrawer: {
			where: "device",
			default: false,
		},
		useBlurEffectForModal: {
			where: "device",
			default: true,
		},
		useBlurEffect: {
			where: "device",
			default: true,
		},
		showFixedPostForm: {
			where: "device",
			default: false,
		},
		enableInfiniteScroll: {
			where: "device",
			default: true,
		},
		useReactionPickerForContextMenu: {
			where: "device",
			default: false,
		},
		showGapBetweenNotesInTimeline: {
			where: "device",
			default: false,
		},
		darkMode: {
			where: "device",
			default: false,
		},
		instanceTicker: {
			where: "device",
			default: "always" as "none" | "remote" | "always",
		},
		reactionPickerSkinTone: {
			where: "account",
			default: 1,
		},
		reactionPickerSize: {
			where: "device",
			default: 3,
		},
		reactionPickerWidth: {
			where: "device",
			default: 3,
		},
		reactionPickerHeight: {
			where: "device",
			default: 3,
		},
		reactionPickerUseDrawerForMobile: {
			where: "device",
			default: true,
		},
		recentlyUsedEmojis: {
			where: "device",
			default: [] as string[],
		},
		recentlyUsedUsers: {
			where: "device",
			default: [] as string[],
		},
		defaultSideView: {
			where: "device",
			default: false,
		},
		menuDisplay: {
			where: "device",
			default: "sideFull" as "sideFull" | "sideIcon" | "top",
		},
		reportError: {
			where: "device",
			default: false,
		},
		squareAvatars: {
			where: "device",
			default: true,
		},
		squareCatAvatars: {
			where: "device",
			default: false,
		},
		postFormWithHashtags: {
			where: "device",
			default: false,
		},
		postFormHashtags: {
			where: "device",
			default: "",
		},
		themeInitial: {
			where: "device",
			default: true,
		},
		numberOfPageCache: {
			where: "device",
			default: 5,
		},
		enterSendsMessage: {
			where: "device",
			default: true,
		},
		showUpdates: {
			where: "device",
			default: true,
		},
		swipeOnDesktop: {
			where: "device",
			default: false,
		},
		swipeOnMobile: {
			where: "device",
			default: true,
		},
		showAdminUpdates: {
			where: "account",
			default: true,
		},
		woozyMode: {
			where: "device",
			default: false,
		},
		enableCustomKaTeXMacro: {
			where: "device",
			default: false,
		},
		enableEmojiReactions: {
			where: "account",
			default: true,
		},
		showEmojisInReactionNotifications: {
			where: "account",
			default: true,
		},
		showTimelineReplies: {
			where: "deviceAccount",
			default: false,
		},
		addRe: {
			where: "account",
			default: true,
		},
		detectPostLanguage: {
			where: "deviceAccount",
			default: true,
		},
		openServerInfo: {
			where: "device",
			default: true,
		},
		iconSet: {
			where: "device",
			default: "ph-bold" as
				| "ph-bold"
				| "ph-duotone"
				| "ph-light"
				| "ph" // this is ph-regular
				| "ph-fill",
		},
		recentlyUsedPostLanguages: {
			where: "account",
			default: [] as string[],
		},
		useEmojiCdn: {
			where: "device",
			default: true,
		},
		showPreviewByDefault: {
			where: "deviceAccount",
			default: false,
		},
		hideFollowButtons: {
			where: "device",
			default: true,
		},
		replaceChatButtonWithAccountButton: {
			where: "device",
			default: true,
		},
		replaceWidgetsButtonWithReloadButton: {
			where: "device",
			default: false,
		},
		searchURL: {
			where: "device",
			default: "https://duckduckgo.com/?q=",
		},
		showBigPostButton: {
			where: "device",
			default: false,
		},
		enableTimelineStreaming: {
			where: "deviceAccount",
			default: true,
		},
		enablePullToRefresh: {
			where: "deviceAccount",
			default: true,
		},
		pullToRefreshThreshold: {
			where: "device",
			default: 150,
		},
		showNoAltTextWarning: {
			where: "account",
			default: true,
		},
		showAddFileDescriptionAtFirstPost: {
			where: "account",
			default: false,
		},
		addAlt4MeTag: {
			where: "account",
			default: false,
		},
		autocorrectNoteLanguage: {
			where: "account",
			default: false,
		},
		foldNotification: {
			where: "deviceAccount",
			default: true,
		},
		mergeThreadInTimeline: {
			where: "deviceAccount",
			default: true,
		},
		mergeRenotesInTimeline: {
			where: "deviceAccount",
			default: true,
		},
		writingMode: {
			where: "deviceAccount",
			default: "horizontal-tb" as
				| "horizontal-tb"
				| "vertical-rl"
				| "vertical-lr"
				| "vertical-rl-upright"
				| "vertical-lr-upright",
		},
	}),
);

import ColdStore from "./cold-store";

export const ColdDeviceStorage = ColdStore;
