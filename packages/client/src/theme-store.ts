import type { Theme } from "./scripts/theme";
import { isSignedIn, me } from "@/me";
import { api } from "@/os";

const lsCacheKey = isSignedIn(me) ? `themes:${me.id}` : "";

export function getThemes(): Theme[] {
	return JSON.parse(localStorage.getItem(lsCacheKey) || "[]");
}

export async function fetchThemes(): Promise<void> {
	if (!isSignedIn(me)) return;

	try {
		const themes = await api("i/registry/get", {
			scope: ["client"],
			key: "themes",
		});
		localStorage.setItem(lsCacheKey, JSON.stringify(themes));
		// biome-ignore lint/suspicious/noExplicitAny: Safely any
	} catch (err: any) {
		if (err.code === "NO_SUCH_KEY") return;
		throw err;
	}
}

export async function addTheme(theme: Theme): Promise<void> {
	await fetchThemes();
	const themes = getThemes().concat(theme);
	await api("i/registry/set", {
		scope: ["client"],
		key: "themes",
		value: themes,
	});
	localStorage.setItem(lsCacheKey, JSON.stringify(themes));
}

export async function removeTheme(theme: Theme): Promise<void> {
	const themes = getThemes().filter((t) => t.id !== theme.id);
	await api("i/registry/set", {
		scope: ["client"],
		key: "themes",
		value: themes,
	});
	localStorage.setItem(lsCacheKey, JSON.stringify(themes));
}
