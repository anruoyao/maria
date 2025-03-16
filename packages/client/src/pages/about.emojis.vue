<template>
	<div class="driuhtrh">
		<div class="query">
			<MkInput v-model="q" class="" :placeholder="i18n.ts.search">
				<template #prefix
					><i :class="icon('ph-magnifying-glass')"></i
				></template>
			</MkInput>
		</div>

		<MkFolder v-if="searchEmojis" class="emojis">
			<template #header>{{ i18n.ts.searchResult }}</template>
			<div class="zuvgdzyt">
				<XEmoji
					v-for="emoji in searchEmojis"
					:key="emoji.name"
					class="emoji"
					:emoji="emoji"
				/>
			</div>
		</MkFolder>

		<MkFolder
			v-for="category in customEmojiCategories"
			:key="category"
			class="emojis"
		>
			<template #header>{{ category || i18n.ts.other }}</template>
			<div class="zuvgdzyt">
				<XEmoji
					v-for="emoji in customEmojis.filter(
						(e) => e.category === category,
					)"
					:key="emoji.name"
					class="emoji"
					:emoji="emoji"
				/>
			</div>
		</MkFolder>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import XEmoji from "./emojis.emoji.vue";
import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/form/input.vue";
import MkSelect from "@/components/form/select.vue";
import MkFolder from "@/components/MkFolder.vue";
import MkTab from "@/components/MkTab.vue";
import { emojiCategories, emojiTags, getInstanceInfo } from "@/instance";
import { i18n } from "@/i18n";
import iconify from "@/scripts/icon";

export default defineComponent({
	components: {
		MkButton,
		MkInput,
		MkSelect,
		MkFolder,
		MkTab,
		XEmoji,
	},

	data() {
		return {
			q: "",
			customEmojiCategories: emojiCategories,
			customEmojis: getInstanceInfo().emojis,
			tags: emojiTags,
			selectedTags: new Set(),
			searchEmojis: null,
			i18n,
		};
	},

	watch: {
		q() {
			this.search();
		},
		selectedTags: {
			handler() {
				this.search();
			},
			deep: true,
		},
	},

	methods: {
		search() {
			if ((this.q === "" || this.q == null) && this.selectedTags.size === 0) {
				this.searchEmojis = null;
				return;
			}

			if (this.selectedTags.size === 0) {
				this.searchEmojis = this.customEmojis.filter(
					(emoji) =>
						emoji.name.includes(this.q) || emoji.aliases.includes(this.q),
				);
			} else {
				this.searchEmojis = this.customEmojis.filter(
					(emoji) =>
						(emoji.name.includes(this.q) || emoji.aliases.includes(this.q)) &&
						[...this.selectedTags].every((t) => emoji.aliases.includes(t)),
				);
			}
		},

		toggleTag(tag) {
			if (this.selectedTags.has(tag)) {
				this.selectedTags.delete(tag);
			} else {
				this.selectedTags.add(tag);
			}
		},

		icon(name: string): string {
			return iconify(name);
		},
	},
});
</script>

<style lang="scss" scoped>
.driuhtrh {
	background: var(--bg);

	> .query {
		background: var(--bg);
		padding: 16px;

		> .tags {
			> .tag {
				display: inline-block;
				margin-block-start: 8px;
				margin-inline-end: 8px;
				margin-block-end: 0;
				margin-inline-start: 0;
				padding-block: 4px;
				padding-inline: 8px;
				font-size: 0.9em;
				background: var(--accentedBg);
				border-radius: 5px;

				&.active {
					background: var(--accent);
					color: var(--fgOnAccent);
				}
			}
		}
	}

	> .emojis {
		--x-padding-block: 0;
padding-inline: 16px;

		.zuvgdzyt {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
			grid-gap: 12px;
			margin-block-start: 0;
			margin-inline-end: var(--margin);
			margin-block-end: var(--margin);
			margin-inline-start: var(--margin);
		}
	}
}
</style>
