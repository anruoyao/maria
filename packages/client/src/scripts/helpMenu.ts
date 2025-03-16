import XTutorial from "@/components/MkTutorialDialog.vue";
import XCheatSheet from "@/components/MkCheatSheetDialog.vue";
import { defaultStore } from "@/store";
import { getInstanceInfo } from "@/instance";
import { host } from "@/config";
import * as os from "@/os";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";
import type { MenuItem } from "@/types/menu";

const instanceSpecificItems: MenuItem[] = [];
const instance = getInstanceInfo();

if (instance.tosUrl != null) {
	instanceSpecificItems.push({
		type: "button",
		text: i18n.ts.tos,
		icon: `${icon("ph-scroll")}`,
		action: () => {
			window.open(instance.tosUrl, "_blank");
		},
	});
}

for (const { name, url } of instance.moreUrls) {
	instanceSpecificItems.push({
		type: "button",
		text: name,
		icon: `${icon("ph-link-simple")}`,
		action: () => {
			window.open(url, "_blank");
		},
	});
}

export function openHelpMenu_(ev: MouseEvent) {
	os.popupMenu(
		[
			{
				text: instance.name ?? host,
				type: "label",
			},
			{
				type: "link",
				text: i18n.ts.instanceInfo,
				icon: `${icon("ph-info")}`,
				to: "/about",
			},
			{
				type: "link",
				text: i18n.ts.aboutFirefish,
				icon: `${icon("ph-lightbulb")}`,
				to: "/about-firefish",
			},
			...(instanceSpecificItems.length >= 2 ? [null] : []),
			...instanceSpecificItems,
			null,
			{
				type: "button",
				action: async () => {
					defaultStore.set("tutorial", 0);
					os.popup(XTutorial, {}, {}, "closed");
				},
				text: i18n.ts.replayTutorial,
				icon: `${icon("ph-circle-wavy-question")}`,
			},
			{
				type: "button",
				text: i18n.ts._mfm.cheatSheet,
				icon: `${icon("ph-question")}`,
				action: async () => {
					os.popup(XCheatSheet, {}, {}, "closed");
				},
			},
			null,
			{
				type: "parent",
				text: i18n.ts.developer,
				icon: `${icon("ph-code")}`,
				children: [
					{
						type: "link",
						to: "/api-console",
						text: "API Console",
						icon: `${icon("ph-terminal-window")}`,
					},
					{
						text: i18n.ts.document,
						icon: `${icon("ph-file-doc")}`,
						action: () => {
							window.open("/api-doc", "_blank");
						},
					},
					{
						type: "link",
						to: "/scratchpad",
						text: "AiScript Scratchpad",
						icon: `${icon("ph-scribble-loop")}`,
					},
				],
			},
		],
		ev.currentTarget ?? ev.target,
	);
}
