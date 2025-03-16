<template>
	<div
		ref="reactionsEl"
		class="reactions-list swiper-no-swiping tdflqwzn"
		:class="{ isMe }"
	>
		<XReaction
			v-for="(count, reaction) in note.reactions"
			:key="reaction"
			:reaction="reaction"
			:count="count"
			:is-initial="initialReactions.has(reaction)"
			:note="note"
			@reacted="reactionsEl.scrollTo(0, 0)"
		/>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import type { entities } from "firefish-js";
import { isSignedIn, me } from "@/me";
import XReaction from "@/components/MkReactionsViewer.reaction.vue";

const props = defineProps<{
	note: entities.Note;
}>();

const reactionsEl = ref<HTMLElement>();

const initialReactions = new Set(Object.keys(props.note.reactions));

const isMe = computed(() => isSignedIn(me) && me.id === props.note.userId);
</script>

<style lang="scss" scoped>
.reactions-list {
	margin-block-start: 0.2em;
	inline-size: 100%;
	display: flex;
	overflow-x: auto;
	overflow-inline: auto;
	margin-inline: -24px;
	padding-inline: 22px 160px;
	mask: linear-gradient(
		var(--gradient-to-inline-end),
		transparent,
		black 24px calc(100% - 160px),
		transparent
	);
	-webkit-mask: linear-gradient(
		var(--gradient-to-inline-end),
		transparent,
		black 24px calc(100% - 160px),
		transparent
	);
	scrollbar-width: none;
	pointer-events: none;

	@supports not (overflow-inline: auto) {
		.vertical-lr &, .vertical-rl & {
			overflow-x: visible;
			overflow-y: auto;
		}
	}

	:deep(*) {
		pointer-events: all;
	}

	&::-webkit-scrollbar {
		display: none;
	}

	&:empty {
		display: none;
	}

	&.isMe {
		> span {
			cursor: default !important;
		}
	}
}
</style>
