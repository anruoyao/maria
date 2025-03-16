import { ref } from "vue";
import { deviceKind } from "@/scripts/device-kind.js";

const isTouchSupported =
	"maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;

export let isTouchUsing =
	deviceKind === "tablet" || deviceKind === "smartphone";

if (isTouchSupported && !isTouchUsing) {
	window.addEventListener(
		"touchstart",
		() => {
			// maxTuochPoints reflects the property of the display, but there are cases where the display has touch functionality but the user uses a mouse.
			// Therefore, we need to check if the user actually uses touch functionality.
			isTouchUsing = true;
		},
		{ passive: true },
	);
}

/** (MkHorizontalSwipe) is during horizontal swipe? */
export const isDuringHorizontalSwipe = ref(false);
