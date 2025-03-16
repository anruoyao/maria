import { computed, reactive } from "vue";
import { ui } from "@/config";
import { i18n } from "@/i18n";
import { isSignedIn, me } from "@/me";
import * as os from "@/os";
import icon from "@/scripts/icon";
import { search } from "@/scripts/search";
import { unisonReload } from "@/scripts/unison-reload";

export const navbarItemDef = reactive({
	notifications: {
		title: "notifications",
		icon: `${icon("ph-bell")}`,
		show: computed(() => isSignedIn(me)),
		indicated: computed(() => me?.hasUnreadNotification),
		to: "/my/notifications",
	},
	messaging: {
		title: "messaging",
		icon: `${icon("ph-chats-teardrop")}`,
		show: computed(() => isSignedIn(me)),
		indicated: computed(() => me?.hasUnreadMessagingMessage),
		to: "/my/messaging",
	},
	drive: {
		title: "drive",
		icon: `${icon("ph-cloud")}`,
		show: computed(() => isSignedIn(me)),
		to: "/my/drive",
	},
	followRequests: {
		title: "followRequests",
		icon: `${icon("ph-hand-waving")}`,
		show: computed(() => me?.isLocked || me?.hasPendingReceivedFollowRequest),
		indicated: computed(() => me?.hasPendingReceivedFollowRequest),
		to: "/my/follow-requests",
	},
	explore: {
		title: "explore",
		icon: `${icon("ph-compass")}`,
		to: "/explore",
	},
	announcements: {
		title: "announcements",
		icon: `${icon("ph-megaphone-simple")}`,
		indicated: computed(() => me?.hasUnreadAnnouncement),
		to: "/announcements",
	},
	search: {
		title: "search",
		icon: `${icon("ph-magnifying-glass")}`,
		action: () => search(),
	},
	lists: {
		title: "lists",
		icon: `${icon("ph-list-bullets ph-dir")}`,
		show: computed(() => isSignedIn(me)),
		to: "/my/lists",
	},
	antennas: {
		title: "antennas",
		icon: `${icon("ph-flying-saucer")}`,
		show: computed(() => isSignedIn(me)),
		to: "/my/antennas",
	},
	favorites: {
		title: "favorites",
		icon: `${icon("ph-bookmark-simple")}`,
		show: computed(() => isSignedIn(me)),
		to: "/my/favorites",
	},
	pages: {
		title: "pages",
		icon: `${icon("ph-file-text ph-dir")}`,
		to: "/pages",
	},
	gallery: {
		title: "gallery",
		icon: `${icon("ph-image-square")}`,
		to: "/gallery",
	},
	clips: {
		title: "clips",
		icon: `${icon("ph-paperclip")}`,
		show: computed(() => isSignedIn(me)),
		to: "/my/clips",
	},
	channels: {
		title: "channel",
		icon: `${icon("ph-television")}`,
		to: "/channels",
	},
	groups: {
		title: "groups",
		icon: `${icon("ph-users-three")}`,
		to: "/my/groups",
	},
	ui: {
		title: "switchUi",
		icon: `${icon("ph-layout ph-dir")}`,
		action: (ev) => {
			os.popupMenu(
				[
					{
						text: i18n.ts.default,
						active: ui === "default" || ui === null,
						action: () => {
							localStorage.setItem("ui", "default");
							unisonReload();
						},
					},
					{
						text: i18n.ts.classic,
						active: ui === "classic",
						action: () => {
							localStorage.setItem("ui", "classic");
							unisonReload();
						},
					},
					{
						text: i18n.ts.deck,
						active: ui === "deck",
						action: () => {
							localStorage.setItem("ui", "deck");
							unisonReload();
						},
					},
				],
				ev.currentTarget ?? ev.target,
			);
		},
	},
	reload: {
		title: "reload",
		icon: `${icon("ph-arrows-clockwise")}`,
		action: (ev) => {
			location.reload();
		},
	},
});
