<template>
	<section class="ssazuxis">
		<header class="_button" @click="showBody = !showBody">
			<div class="title"><slot name="header"></slot></div>
			<div class="divider"></div>
			<button
				v-vibrate="5"
				class="_button"
				:aria-expanded="showBody"
				:aria-controls="bodyId"
			>
				<template v-if="showBody"
					><i class="ph-caret-up ph-dir ph-bold ph-lg"></i
				></template>
				<template v-else
					><i class="ph-caret-down ph-dir ph-bold ph-lg"></i
				></template>
			</button>
		</header>
		<transition
			:name="animation ? 'folder-toggle' : ''"
			@enter="enter"
			@after-enter="afterEnter"
			@leave="leave"
			@after-leave="afterLeave"
		>
			<div v-show="showBody" :id="bodyId">
				<slot></slot>
			</div>
		</transition>
	</section>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { getUniqueId } from "@/os";
import { defaultStore } from "@/store";
// import icon from "@/scripts/icon";

const localStoragePrefix = "ui:folder:";

const props = withDefaults(
	defineProps<{
		expanded?: boolean;
		persistKey?: string | null;
	}>(),
	{
		expanded: true,
		persistKey: null,
	},
);

const bodyId = ref(getUniqueId());

const showBody = ref(
	props.persistKey &&
		localStorage.getItem(localStoragePrefix + props.persistKey)
		? localStorage.getItem(localStoragePrefix + props.persistKey) === "t"
		: props.expanded,
);

const animation = defaultStore.state.animation;

watch(showBody, () => {
	if (props.persistKey) {
		localStorage.setItem(
			localStoragePrefix + props.persistKey,
			showBody.value ? "t" : "f",
		);
	}
});

function toggleContent(show: boolean) {
	showBody.value = show;
}

function enter(el) {
	const elementHeight = el.getBoundingClientRect().height;
	el.style.height = 0;
	el.offsetHeight; // reflow
	// biome-ignore lint/style/useTemplate: <explanation>
	el.style.height = elementHeight + "px";
}
function afterEnter(el) {
	el.style.height = null;
}
function leave(el) {
	const elementHeight = el.getBoundingClientRect().height;
	// biome-ignore lint/style/useTemplate: <explanation>
	el.style.height = elementHeight + "px";
	el.offsetHeight; // reflow
	el.style.height = 0;
}
function afterLeave(el) {
	el.style.height = null;
}

defineExpose({
	toggleContent,
	enter,
	afterEnter,
	leave,
	afterLeave,
});
</script>

<style lang="scss" scoped>
.folder-toggle-enter-active,
.folder-toggle-leave-active {
	overflow-y: hidden;
	overflow-block: hidden;
	transition:
		opacity 0.5s,
		height 0.5s !important;

	@supports not (overflow-block: hidden) {
		.vertical-lr &, .vertical-rl & {
			overflow-y: visible;
			overflow-x: hidden;
		}
	}
}
.folder-toggle-enter-from {
	opacity: 0;
}
.folder-toggle-leave-to {
	opacity: 0;
}

.ssazuxis {
	position: relative;

	> header {
		display: flex;
		position: relative;
		z-index: 10;
		position: sticky;
		inset-block-start: var(--stickyTop, 0px);
		padding: var(--x-padding);
		-webkit-backdrop-filter: var(--blur, blur(8px));
		backdrop-filter: var(--blur, blur(20px));
		margin-inline: -12px;
		padding-inline: 12px;
		mask: linear-gradient(
			var(--gradient-to-inline-end),
			transparent,
			black 12px calc(100% - 12px),
			transparent
		);
		-webkit-mask: linear-gradient(
			var(--gradient-to-inline-end),
			transparent,
			black 12px calc(100% - 12px),
			transparent
		);

		&::before {
			content: "";
			position: absolute;
			inset: 0;
			background: var(--bg);
			opacity: 0.85;
			z-index: -1;
		}

		> .title {
			margin: 0;
			padding-block-start: 12px;
			padding-inline-end: 16px;
			padding-block-end: 12px;
			padding-inline-start: 0;

			> i {
				margin-inline-end: 6px;
			}

			&:empty {
				display: none;
			}
		}

		> .divider {
			flex: 1;
			margin: auto;
			block-size: 1px;
			background: var(--divider);
		}

		> button {
			padding-block-start: 12px;
			padding-inline-end: 0;
			padding-block-end: 12px;
			padding-inline-start: 16px;
		}
	}
}
</style>
