import { notePage } from "@/filters/note";
import * as os from "@/os";
import { defaultStore } from "@/store";
import type { NoteType } from "@/types/note";
import icon from "./icon";
import { i18n } from "@/i18n";
import copyToClipboard from "./copy-to-clipboard";
import { useRouter } from "@/router";

const router = useRouter();
import { url } from "@/config";

export function showNoteContextMenu({
	ev,
	note,
	react,
}: {
	ev: MouseEvent;
	note: NoteType;
	react: () => void;
}): void {
	const isLink = (el: HTMLElement): boolean => {
		if (el.tagName === "A") return true;
		// The Audio element's context menu is the browser default, such as for selecting playback speed.
		if (el.tagName === "AUDIO") return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
		return false;
	};
	if (isLink(ev.target as HTMLElement)) return;
	if (window.getSelection()?.toString() !== "") return;

	if (defaultStore.state.useReactionPickerForContextMenu) {
		ev.preventDefault();
		react();
	} else {
		os.contextMenu(
			[
				{
					type: "label",
					text: notePage(note),
				},
				{
					icon: `${icon("ph-browser")}`,
					text: i18n.ts.openInWindow,
					action: () => {
						os.pageWindow(notePage(note));
					},
				},
				notePage(note) !== location.pathname
					? {
							icon: `${icon("ph-arrows-out-simple")}`,
							text: i18n.ts.showInPage,
							action: () => {
								router.push(notePage(note), "forcePage");
							},
						}
					: undefined,
				null,
				{
					type: "a",
					icon: `${icon("ph-arrow-square-out")}`,
					text: i18n.ts.openInNewTab,
					href: notePage(note),
					target: "_blank",
				},
				{
					icon: `${icon("ph-link-simple")}`,
					text: i18n.ts.copyLink,
					action: () => {
						copyToClipboard(`${url}${notePage(note)}`);
						os.success();
					},
				},
				note.user.host != null
					? {
							type: "a",
							icon: `${icon("ph-arrow-square-up-right")}`,
							text: i18n.ts.showOnRemote,
							href: note.url ?? note.uri ?? "",
							target: "_blank",
						}
					: undefined,
			],
			ev,
		);
	}
}
