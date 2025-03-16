<template>
	<FocusTrap :active="isActive">
		<div
			class="omfetrab"
			:class="['s' + size, 'w' + width, 'h' + height, { asDrawer }]"
			:style="{ maxHeight: maxHeight ? maxHeight + 'px' : undefined }"
			tabindex="-1"
		>
			<input
				ref="search"
				v-model.trim="q"
				class="search"
				data-prevent-emoji-insert
				:class="{ filled: q != null && q != '' }"
				:placeholder="i18n.ts.search"
				type="search"
				@paste.stop="paste"
				@keyup.enter="done()"
			/>
			<div ref="emojis" class="emojis">
				<section class="result">
					<div v-if="searchResultCustom.length > 0" class="body">
						<button
							v-for="emoji in searchResultCustom"
							:key="emoji.id"
							v-vibrate="50"
							class="_button item"
							:title="emoji.name"
							tabindex="0"
							@click="chosen(emoji, $event)"
						>
							<!--<MkEmoji v-if="emoji.char != null" :emoji="emoji.char"/>-->
							<img
								class="emoji"
								:src="
									disableShowingAnimatedImages
										? getStaticImageUrl(emoji.url)
										: emoji.url
								"
							/>
						</button>
					</div>
					<div v-if="searchResultUnicode.length > 0" class="body">
						<button
							v-for="emoji in searchResultUnicode"
							:key="emoji.slug"
							class="_button item"
							:title="emoji.slug"
							tabindex="0"
							@click="chosen(emoji, $event)"
						>
							<MkEmoji class="emoji" :emoji="emoji.emoji" />
						</button>
					</div>
				</section>

				<div v-if="tab === 'index'" class="group index">
					<section v-if="showPinned">
						<div class="body">
							<button
								v-for="emoji in pinned"
								:key="emoji"
								class="_button item"
								tabindex="0"
								@click="chosen(emoji, $event)"
							>
								<MkEmoji
									class="emoji"
									:emoji="emoji"
									:normal="true"
								/>
							</button>
						</div>
					</section>

					<section>
						<header class="_acrylic">
							<i :class="icon('ph-alarm ph-fw')"></i>
							{{ i18n.ts.recentUsed }}
						</header>
						<div class="body">
							<button
								v-for="emoji in recentlyUsedEmojis"
								:key="emoji"
								class="_button item"
								@click="chosen(emoji, $event)"
							>
								<MkEmoji
									class="emoji"
									:emoji="emoji"
									:normal="true"
								/>
							</button>
						</div>
					</section>
				</div>
				<div v-once class="group">
					<header>{{ i18n.ts.customEmojis }}</header>
					<XSection
						v-for="category in customEmojiCategories"
						:key="'custom:' + category"
						:initial-shown="false"
						:emojis="
							customEmojis
								.filter((e) => e.category === category)
								.map((e) => ':' + e.name + ':')
						"
						@chosen="chosen"
						>{{ category || i18n.ts.other }}</XSection
					>
				</div>
				<div v-once class="group">
					<header>{{ i18n.ts.emoji }}</header>
					<XSection
						v-for="category in unicodeEmojiCategories"
						:key="category.slug"
						:skin-tone-selector="category.slug === 'people_body'"
						:skin-tones="unicodeEmojiSkinTones"
						:skin-tone-labels="unicodeEmojiSkinToneLabels"
						:emojis="
							emojilist
								.filter(
									(e) => e.category_slug === category.slug,
								)
								.map((e) => e.emoji)
						"
						@chosen="chosen"
						>{{ category.name }}</XSection
					>
				</div>
			</div>
			<div class="tabs">
				<button
					class="_button tab"
					:class="{ active: tab === 'index' }"
					@click="tab = 'index'"
				>
					<i :class="icon('ph-asterisk ph-fw')"></i>
				</button>
				<button
					class="_button tab"
					:class="{ active: tab === 'custom' }"
					@click="tab = 'custom'"
				>
					<i :class="icon('ph-smiley ph-fw')"></i>
				</button>
				<button
					class="_button tab"
					:class="{ active: tab === 'unicode' }"
					@click="tab = 'unicode'"
				>
					<i :class="icon('ph-leaf ph-fw')"></i>
				</button>
				<button
					class="_button tab"
					:class="{ active: tab === 'tags' }"
					@click="tab = 'tags'"
				>
					<i :class="icon('ph-hash ph-fw')"></i>
				</button>
			</div>
		</div>
	</FocusTrap>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import type { entities } from "firefish-js";
import { FocusTrap } from "focus-trap-vue";
import XSection from "@/components/MkEmojiPicker.section.vue";
import type { UnicodeEmojiDef } from "@/scripts/emojilist";
import { emojilist, unicodeEmojiCategories } from "@/scripts/emojilist";
import { getStaticImageUrl } from "@/scripts/get-static-image-url";
import Ripple from "@/components/MkRipple.vue";
import * as os from "@/os";
import { isTouchUsing } from "@/scripts/touch";
import { deviceKind } from "@/scripts/device-kind";
import { emojiCategories, getInstanceInfo } from "@/instance";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

// FIXME: This variable doesn't seem to be used at all. I don't know why it was here.
const isActive = ref<boolean>();

type EmojiDef = string | entities.CustomEmoji | UnicodeEmojiDef;

const props = withDefaults(
	defineProps<{
		showPinned?: boolean;
		asReactionPicker?: boolean;
		maxHeight?: number;
		asDrawer?: boolean;
	}>(),
	{
		showPinned: true,
	},
);

const emit = defineEmits<{
	chosen: [v: string, ev?: MouseEvent];
}>();

const search = ref<HTMLInputElement>();
const emojis = ref<HTMLDivElement>();

const {
	reactions: pinned,
	reactionPickerSize,
	reactionPickerWidth,
	reactionPickerHeight,
	disableShowingAnimatedImages,
	recentlyUsedEmojis,
} = defaultStore.reactiveState;

const unicodeEmojiSkinTones = [
	"#FFDC5E",
	"#F7DFCF",
	"#F3D3A3",
	"#D6AE89",
	"#B17F56",
	"#7D523C",
];

const unicodeEmojiSkinToneLabels = [
	i18n.ts._skinTones?.yellow ?? "Yellow",
	i18n.ts._skinTones?.light ?? "Light",
	i18n.ts._skinTones?.mediumLight ?? "Medium Light",
	i18n.ts._skinTones?.medium ?? "Medium",
	i18n.ts._skinTones?.mediumDark ?? "Medium Dark",
	i18n.ts._skinTones?.dark ?? "Dark",
];

const size = reactionPickerSize;
const width = reactionPickerWidth;
const height = reactionPickerHeight;
const customEmojiCategories = emojiCategories;
const customEmojis = getInstanceInfo().emojis;
const q = ref<string | null>(null);
const searchResultCustom = ref<entities.CustomEmoji[]>([]);
const searchResultUnicode = ref<UnicodeEmojiDef[]>([]);
const tab = ref<"index" | "custom" | "unicode" | "tags">("index");

watch(q, () => {
	if (emojis.value) emojis.value.scrollTop = 0;

	if (q.value == null || q.value === "") {
		searchResultCustom.value = [];
		searchResultUnicode.value = [];
		return;
	}

	const newQ = q.value.replace(/:/g, "").toLowerCase();

	const searchCustom = () => {
		const max = 100;
		const emojis = customEmojis;
		const matches = new Set<entities.CustomEmoji>();

		const exactMatch = emojis.find((emoji) => emoji.name === newQ);
		if (exactMatch) matches.add(exactMatch);

		if (newQ.includes(" ")) {
			// AND検索
			const keywords = newQ.split(" ");

			// 名前にキーワードが含まれている
			for (const emoji of emojis) {
				if (keywords.every((keyword) => emoji.name.includes(keyword))) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
			if (matches.size >= max) return matches;

			// 名前またはエイリアスにキーワードが含まれている
			for (const emoji of emojis) {
				if (
					keywords.every(
						(keyword) =>
							emoji.name.includes(keyword) ||
							emoji.aliases.some((alias) => alias.includes(keyword)),
					)
				) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
		} else {
			for (const emoji of emojis) {
				if (emoji.name.startsWith(newQ)) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
			if (matches.size >= max) return matches;

			for (const emoji of emojis) {
				if (emoji.aliases.some((alias) => alias.startsWith(newQ))) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
			if (matches.size >= max) return matches;

			for (const emoji of emojis) {
				if (emoji.name.includes(newQ)) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
			if (matches.size >= max) return matches;

			for (const emoji of emojis) {
				if (emoji.aliases.some((alias) => alias.includes(newQ))) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
		}

		return matches;
	};

	const searchUnicode = () => {
		const max = 32;
		const emojis = emojilist;
		const matches = new Set<UnicodeEmojiDef>();

		const exactMatch = emojis.find((emoji) => emoji.slug === newQ);
		if (exactMatch) matches.add(exactMatch);

		if (newQ.includes(" ")) {
			// AND検索
			const keywords = newQ.split(" ");

			// 名前にキーワードが含まれている
			for (const emoji of emojis) {
				if (keywords.every((keyword) => emoji.slug.includes(keyword))) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
			if (matches.size >= max) return matches;

			// 名前またはエイリアスにキーワードが含まれている
			for (const emoji of emojis) {
				if (
					keywords.every(
						(keyword) =>
							emoji.slug.includes(keyword) ||
							emoji.keywords?.some((alias) => alias.includes(keyword)),
					)
				) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
		} else {
			for (const emoji of emojis) {
				if (emoji.slug.startsWith(newQ)) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
			if (matches.size >= max) return matches;

			for (const emoji of emojis) {
				if (emoji.keywords?.some((keyword) => keyword.startsWith(newQ))) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
			if (matches.size >= max) return matches;

			for (const emoji of emojis) {
				if (emoji.slug.includes(newQ)) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
			if (matches.size >= max) return matches;

			for (const emoji of emojis) {
				if (emoji.keywords?.some((keyword) => keyword.includes(newQ))) {
					matches.add(emoji);
					if (matches.size >= max) break;
				}
			}
		}

		return matches;
	};

	searchResultCustom.value = Array.from(searchCustom());
	searchResultUnicode.value = Array.from(searchUnicode());
});

function focus() {
	if (!["smartphone", "tablet"].includes(deviceKind) && !isTouchUsing) {
		search.value?.focus({
			preventScroll: true,
		});
	}
}

function reset() {
	if (emojis.value) emojis.value.scrollTop = 0;
	q.value = "";
}

function getKey(emoji: EmojiDef): string {
	if (typeof emoji === "string") {
		return emoji;
	}
	if ("emoji" in emoji) {
		return emoji.emoji;
	}
	return `:${emoji.name}:`;
}

function chosen(emoji: EmojiDef, ev?: MouseEvent) {
	const el =
		ev && ((ev.currentTarget ?? ev.target) as HTMLElement | null | undefined);
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + el.offsetWidth / 2;
		const y = rect.top + el.offsetHeight / 2;
		os.popup(Ripple, { x, y }, {}, "end");
	}

	const key = getKey(emoji);
	emit("chosen", key, ev);

	// 最近使った絵文字更新
	if (!pinned.value.includes(key)) {
		let recents = defaultStore.state.recentlyUsedEmojis;
		recents = recents.filter((emoji) => emoji !== key);
		recents.unshift(key);
		defaultStore.set("recentlyUsedEmojis", recents.splice(0, 32));
	}
}

async function paste(event: ClipboardEvent) {
	let pasteStr: string | null = null;
	if (event.clipboardData) {
		pasteStr = event.clipboardData.getData("text");
	} else {
		// Use native api
		try {
			pasteStr = await window.navigator.clipboard.readText();
		} catch (_err) {
			// Reading the clipboard requires permission, and the user did not give it
		}
	}
	if (done(pasteStr)) {
		event.preventDefault();
	}
}

function done(query?: string | null): boolean {
	if (query == null) query = q.value;
	if (query == null || typeof query !== "string") return false;

	const q2 = query.replaceAll(":", "");
	const exactMatchCustom = customEmojis.find((emoji) => emoji.name === q2);
	if (exactMatchCustom) {
		chosen(exactMatchCustom);
		return true;
	}
	const exactMatchUnicode = emojilist.find(
		(emoji) => emoji.emoji === q2 || emoji.slug === q2,
	);
	if (exactMatchUnicode) {
		chosen(exactMatchUnicode);
		return true;
	}
	if (searchResultCustom.value.length > 0) {
		chosen(searchResultCustom.value[0]);
		return true;
	}
	if (searchResultUnicode.value.length > 0) {
		chosen(searchResultUnicode.value[0]);
		return true;
	}
	return false;
}

onMounted(() => {
	focus();
});

defineExpose({
	focus,
	reset,
});
</script>

<style lang="scss" scoped>
.omfetrab {
	$pad: 8px;

	display: flex;
	flex-direction: column;

	&.s1 {
		--eachSize: 40px;
	}

	&.s2 {
		--eachSize: 45px;
	}

	&.s3 {
		--eachSize: 50px;
	}

	&.w1 {
		inline-size: calc((var(--eachSize) * 5) + (#{$pad} * 2));
		--columns: 1fr 1fr 1fr 1fr 1fr;
	}

	&.w2 {
		inline-size: calc((var(--eachSize) * 6) + (#{$pad} * 2));
		--columns: 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	&.w3 {
		inline-size: calc((var(--eachSize) * 7) + (#{$pad} * 2));
		--columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	&.w4 {
		inline-size: calc((var(--eachSize) * 8) + (#{$pad} * 2));
		--columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	&.w5 {
		inline-size: calc((var(--eachSize) * 9) + (#{$pad} * 2));
		--columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	&.h1 {
		block-size: calc((var(--eachSize) * 4) + (#{$pad} * 2));
	}

	&.h2 {
		block-size: calc((var(--eachSize) * 6) + (#{$pad} * 2));
	}

	&.h3 {
		block-size: calc((var(--eachSize) * 8) + (#{$pad} * 2));
	}

	&.h4 {
		block-size: calc((var(--eachSize) * 10) + (#{$pad} * 2));
	}

	&.asDrawer {
		inline-size: 100% !important;

		> .emojis {
			::v-deep(section) {
				> header {
					block-size: 32px;
					line-height: 32px;
					padding-block: 0;
					padding-inline: 12px;
					font-size: 15px;
				}

				> .body {
					display: grid;
					grid-template-columns: var(--columns);
					font-size: 30px;

					> .item {
						aspect-ratio: 1 / 1;
						inline-size: auto;
						block-size: auto;
						min-inline-size: 0;
					}
				}
			}
		}
	}

	> .search {
		inline-size: 100%;
		padding: 12px;
		box-sizing: border-box;
		font-size: 1em;
		outline: none;
		border: none;
		background: transparent;
		color: var(--fg);

		&:not(.filled) {
			order: 1;
			z-index: 2;
			box-shadow: 0px -1px 0 0px var(--divider);
		}
	}

	> .tabs {
		display: flex;
		display: none;

		> .tab {
			flex: 1;
			block-size: 38px;
			border-block-start: solid 0.5px var(--divider);

			&.active {
				border-block-start: solid 1px var(--accent);
				color: var(--accent);
			}
		}
	}

	> .emojis {
		block-size: 100%;
		overflow-y: auto;
		overflow-block: auto;
		overflow-x: hidden;
		overflow-inline: hidden;

		scrollbar-width: none;

		@supports not (overflow-block: auto) {
			.vertical-lr &, .vertical-rl & {
				overflow-y: hidden;
				overflow-x: auto;
			}
		}

		&::-webkit-scrollbar {
			display: none;
		}

		> .group {
			&:not(.index) {
				padding-block-start: 4px;
				padding-inline-end: 0;
				padding-block-end: 8px;
				padding-inline-start: 0;
				border-block-start: solid 0.5px var(--divider);
			}

			> header {
				/*position: sticky;
				inset-block-start: 0;
				inset-inline-start: 0;*/
				block-size: 32px;
				line-height: 32px;
				z-index: 2;
				padding-block: 0;
				padding-inline: 8px;
				font-size: 12px;
			}
		}

		::v-deep(section) {
			> header {
				position: sticky;
				inset-block-start: 0;
				inset-inline-start: 0;
				block-size: 32px;
				line-height: 32px;
				z-index: 1;
				padding-block: 0;
				padding-inline: 8px;
				font-size: 12px;
				cursor: pointer;

				&:hover {
					color: var(--accent);
				}
			}

			> .body {
				position: relative;
				padding: $pad;

				> .item {
					position: relative;
					padding: 0;
					inline-size: var(--eachSize);
					block-size: var(--eachSize);
					contain: strict;
					border-radius: 4px;
					font-size: 24px;

					&:focus-visible {
						outline: solid 2px var(--focus);
						z-index: 1;
					}

					&:hover {
						background: rgba(0, 0, 0, 0.05);
					}

					&:active {
						background: var(--accent);
						box-shadow: inset 0 0.15em 0.3em rgba(27, 31, 35, 0.15);
					}

					> .emoji {
						block-size: 1.25em;
						vertical-align: -0.25em;
						pointer-events: none;
					}
				}
			}

			&.result {
				border-block-end: solid 0.5px var(--divider);

				&:empty {
					display: none;
				}
			}
		}
	}
}
</style>
