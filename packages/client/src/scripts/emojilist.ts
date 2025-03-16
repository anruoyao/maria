import data from "unicode-emoji-json/data-by-group.json";
import emojiComponents from "unicode-emoji-json/data-emoji-components.json";
import individualData from "unicode-emoji-json/data-by-emoji.json";
import keywordSet from "emojilib";
import { defaultStore } from "@/store";

export interface UnicodeEmojiDef {
	emoji: string;
	category: (typeof unicodeEmojiCategories)[number]["name"];
	category_slug: (typeof unicodeEmojiCategories)[number]["slug"];
	skin_tone_support: boolean;
	slug: string;
	keywords?: string[];
}

export const unicodeEmojiCategories = data.map((categories) => ({
	slug: categories.slug,
	name: categories.name,
}));

export function addSkinTone(emoji: string, skinTone?: number) {
	const chosenSkinTone = skinTone || defaultStore.state.reactionPickerSkinTone;
	const skinToneModifiers = [
		"",
		emojiComponents.light_skin_tone,
		emojiComponents.medium_light_skin_tone,
		emojiComponents.medium_skin_tone,
		emojiComponents.medium_dark_skin_tone,
		emojiComponents.dark_skin_tone,
	];
	const strippedEmoji = emoji.replace(
		new RegExp(`(${skinToneModifiers.slice(1).join("|")})`, "gi"),
		"",
	);
	if (individualData[strippedEmoji].skin_tone_support) {
		return strippedEmoji + (skinToneModifiers[chosenSkinTone - 1] || "");
	} else {
		return emoji;
	}
}

export const emojilist: UnicodeEmojiDef[] = data
	.flatMap((category) =>
		category.emojis.map((emoji) => ({
			...emoji,
			category: category.name,
			category_slug: category.slug,
			keywords: keywordSet[emoji.emoji],
		})),
	)
	.map((item) => ({
		emoji: item.emoji,
		slug: item.slug,
		category: item.category,
		category_slug: item.category_slug,
		skin_tone_support: item.skin_tone_support || false,
		keywords: item.keywords || [],
	}));
