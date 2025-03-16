<template>
	<MkEmoji
		:emoji="reaction"
		:custom-emojis="customEmojis || []"
		:is-reaction="true"
		:normal="true"
		:no-style="noStyle"
	/>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";

defineProps<{
	reaction: string;
	customEmojis?: entities.EmojiLite[];
	noStyle?: boolean;
}>();
</script>
