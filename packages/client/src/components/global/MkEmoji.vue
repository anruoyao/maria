<template>
	<img
		v-if="customEmoji"
		class="mk-emoji custom"
		:class="{ normal, noStyle }"
		:src="url"
		:alt="alt || undefined"
		:title="alt || undefined"
		decoding="async"
	/>
	<img
		v-else-if="char && !useOsNativeEmojis"
		class="mk-emoji"
		:src="url"
		:alt="alt!"
		:title="alt!"
		decoding="async"
	/>
	<span v-else-if="char && useOsNativeEmojis">{{ char }}</span>
	<span v-else>{{ emoji }}</span>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { entities } from "firefish-js";
import { getStaticImageUrl } from "@/scripts/get-static-image-url";
import { char2filePath } from "@/scripts/twemoji-base";
import { defaultStore } from "@/store";
import { getInstanceInfo } from "@/instance";

const props = defineProps<{
	emoji: string;
	normal?: boolean;
	noStyle?: boolean;
	customEmojis?: entities.EmojiLite[];
	isReaction?: boolean;
}>();

const isCustom = computed(() => props.emoji.startsWith(":"));
const char = computed(() => (isCustom.value ? null : props.emoji));
const useOsNativeEmojis = computed(
	() => defaultStore.state.useOsNativeEmojis && !props.isReaction,
);
const ce = computed(() => props.customEmojis ?? getInstanceInfo().emojis ?? []);
const customEmoji = computed(() =>
	isCustom.value
		? ce.value.find(
				(x) => x.name === props.emoji.substring(1, props.emoji.length - 1),
			)
		: null,
);
const url = computed(() => {
	if (char.value) {
		return char2filePath(char.value);
	} else {
		return defaultStore.state.disableShowingAnimatedImages
			? getStaticImageUrl(customEmoji.value!.url)
			: customEmoji.value?.url;
	}
});
const alt = computed(() =>
	customEmoji.value ? `:${customEmoji.value.name}:` : char.value,
);
</script>

<style lang="scss" scoped>
.mk-emoji {
	block-size: 1.25em;
	vertical-align: -0.25em;

	&.custom {
		block-size: 2em;
		vertical-align: middle;
		transition: transform 0.2s ease;

		&:hover {
			transform: scale(1.2);
		}

		&.normal {
			block-size: 1.25em;
			vertical-align: -0.25em;

			&:hover {
				transform: none;
			}
		}
	}

	&.noStyle {
		block-size: auto !important;
	}
}
</style>
