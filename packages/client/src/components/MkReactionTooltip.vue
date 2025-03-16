<template>
	<MkTooltip
		ref="tooltip"
		:target-element="targetElement"
		:max-width="340"
		:showing="showing"
		@closed="emit('closed')"
	>
		<div class="beeadbfb">
			<XReactionIcon
				:reaction="reaction"
				:custom-emojis="emojis"
				class="icon"
				:no-style="true"
			/>
			<div class="name">{{ reaction.replace("@.", "") }}</div>
		</div>
	</MkTooltip>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";
import MkTooltip from "./MkTooltip.vue";
import XReactionIcon from "@/components/MkReactionIcon.vue";

defineProps<{
	showing: boolean;
	reaction: string;
	emojis: entities.EmojiLite[];
	targetElement: HTMLElement;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();
</script>

<style lang="scss" scoped>
.beeadbfb {
	text-align: center;

	> .icon {
		display: block;
		inline-size: 60px;
		font-size: 60px; // unicodeな絵文字についてはwidthが効かないため
		margin-block: 0;
		margin-inline: auto;
	}

	> .name {
		font-size: 0.9em;
	}
}
</style>
