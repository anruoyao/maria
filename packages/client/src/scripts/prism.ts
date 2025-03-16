import Prism from "prismjs";
import "prismjs/plugins/autoloader/prism-autoloader.js";
import { defaultStore } from "@/store";

Prism.plugins.autoloader.languages_path = defaultStore.state.useEmojiCdn
	? "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/"
	: "/client-assets/prismjs/components/";

const nonExistingLanguagesCache = new Set<string>();
export const loadLanguage = (lang: string) =>
	new Promise<void>((resolve, reject) => {
		// cached non-existing language
		if (nonExistingLanguagesCache.has(lang)) return reject();
		// load language with autoloader
		Prism.plugins.autoloader.loadLanguages(
			lang,
			// loaded
			() => resolve(),
			// failed
			() => {
				nonExistingLanguagesCache.add(lang);
				reject();
			},
		);
	});

export default Prism;
