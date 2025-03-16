import { Stream } from "firefish-js";
import { markRaw } from "vue";
import { url } from "@/config";
import { me } from "@/me";

let stream: Stream | null = null;
let timeoutHeartBeat: number | null = null;
export let isReloading = false;

export function useStream() {
	if (stream != null) return stream;

	stream = markRaw(
		new Stream(
			url,
			me
				? {
						token: me.token,
					}
				: null,
		),
	);
	timeoutHeartBeat = window.setTimeout(heartbeat, 1000 * 60);

	return stream;
}

export function reloadStream() {
	if (stream == null) return useStream();
	if (timeoutHeartBeat != null) window.clearTimeout(timeoutHeartBeat);

	isReloading = true;
	stream.close();
	// biome-ignore lint/suspicious/noAssignInExpressions: assign intentionally
	stream.once("_connected_", () => (isReloading = false));
	stream.stream.reconnect();
	isReloading = false;

	return stream;
}

function heartbeat(): void {
	if (stream != null && document.visibilityState === "visible") {
		stream.send("ping");
	}
	timeoutHeartBeat = window.setTimeout(heartbeat, 1000 * 60);
}
