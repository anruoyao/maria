<template>
	<div
		ref="el"
		v-size="{ max: [380] }"
		class="ukygtjoj _panel"
		:class="{
			naked,
			thin,
			hideHeader: !showHeader,
			scrollable,
			closed: !showBody,
		}"
	>
		<header v-if="showHeader" ref="header">
			<div class="title"><slot name="header"></slot></div>
			<div class="sub">
				<slot name="func"></slot>
				<button
					v-if="foldable"
					class="_button"
					@click="() => (showBody = !showBody)"
				>
					<template v-if="showBody"
						><i :class="icon('ph-caret-up ph-dir')"></i
					></template>
					<template v-else
						><i :class="icon('ph-caret-down ph-dir')"></i
					></template>
				</button>
			</div>
		</header>
		<transition
			:name="defaultStore.state.animation ? 'container-toggle' : ''"
			@enter="enter"
			@after-enter="afterEnter"
			@leave="leave"
			@after-leave="afterLeave"
		>
			<div
				v-show="showBody"
				ref="content"
				class="content"
				:class="{ omitted }"
			>
				<slot></slot>
				<button
					v-if="omitted"
					class="fade _button"
					@click="
						() => {
							ignoreOmit = true;
							omitted = false;
						}
					"
				>
					<span>{{ i18n.ts.showMore }}</span>
				</button>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const props = withDefaults(
	defineProps<{
		showHeader?: boolean;
		thin?: boolean;
		naked?: boolean;
		foldable?: boolean;
		expanded?: boolean;
		scrollable?: boolean;
		maxHeight?: number | null;
	}>(),
	{
		showHeader: true,
		thin: false,
		naked: false,
		foldable: false,
		expanded: true,
		scrollable: false,
		maxHeight: null,
	},
);

const showBody = ref(props.expanded);
const omitted = ref<boolean | null>(null);
const ignoreOmit = ref(false);
const el = ref<HTMLElement | null>(null);
const header = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

function toggleContent(show: boolean) {
	if (!props.foldable) return;
	showBody.value = show;
}

function enter(el) {
	const elementHeight = el.getBoundingClientRect().height;
	el.style.height = 0;
	el.offsetHeight; // reflow
	el.style.height = `${elementHeight}px`;
}
function afterEnter(el) {
	el.style.height = null;
}
function leave(el) {
	const elementHeight = el.getBoundingClientRect().height;
	el.style.height = `${elementHeight}px`;
	el.offsetHeight; // reflow
	el.style.height = 0;
}
function afterLeave(el) {
	el.style.height = null;
}

onMounted(() => {
	watch(
		showBody,
		(showBody) => {
			const headerHeight = props.showHeader ? header.value!.offsetHeight : 0;
			el.value!.style.minHeight = `${headerHeight}px`;
			if (showBody) {
				el.value!.style.flexBasis = "auto";
			} else {
				el.value!.style.flexBasis = `${headerHeight}px`;
			}
		},
		{
			immediate: true,
		},
	);

	if (props.maxHeight != null) {
		el.value!.style.setProperty("--maxHeight", `${props.maxHeight}px`);
	}

	const calcOmit = () => {
		if (
			omitted.value ||
			ignoreOmit.value ||
			props.maxHeight == null ||
			content.value == null
		)
			return;
		const height = content.value.offsetHeight;
		omitted.value = height > props.maxHeight;
	};

	calcOmit();

	new ResizeObserver((_entries, _observer) => {
		calcOmit();
	}).observe(content.value!);
});

defineExpose({
	toggleContent,
	enter,
	afterEnter,
	leave,
	afterLeave,
});
</script>

<style lang="scss" scoped>
.container-toggle-enter-active,
.container-toggle-leave-active {
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
.container-toggle-enter-from {
	opacity: 0;
}
.container-toggle-leave-to {
	opacity: 0;
}

.ukygtjoj {
	position: relative;
	overflow: clip;
	contain: content;

	&.naked {
		background: transparent !important;
		box-shadow: none !important;
	}

	&.scrollable {
		display: flex;
		flex-direction: column;
		flex-grow: 1;

		> .content {
			overflow: auto;
		}
	}

	> header {
		position: sticky;
		inset-block-start: var(--stickyTop, 0px);
		inset-inline-start: 0;
		color: var(--panelHeaderFg);
		background: var(--panelHeaderBg);
		border-block-end: solid 0.5px var(--panelHeaderDivider);
		z-index: 2;
		line-height: 1.4em;

		> .title {
			margin: 0;
			padding-block: 12px;
			padding-inline: 16px;

			> ::v-deep(i) {
				margin-inline-end: 6px;
				transform: translateY(0.1em);
			}

			&:empty {
				display: none;
			}
		}

		> .sub {
			position: absolute;
			z-index: 2;
			inset-block-start: 0;
			inset-inline-end: 0;
			block-size: 100%;

			> ::v-deep(button) {
				inline-size: 42px;
				block-size: 100%;
			}
		}
	}

	> .content {
		--stickyTop: 0px;

		&.omitted {
			position: relative;
			max-block-size: var(--maxHeight);
			overflow: hidden;

			> .fade {
				display: block;
				position: absolute;
				z-index: 10;
				inset-block-end: 0;
				inset-inline-start: 0;
				inline-size: 100%;
				block-size: 64px;
				background: linear-gradient(var(--gradient-to-block-start), var(--panel), var(--X15));

				> span {
					display: inline-block;
					background: var(--panel);
					padding-block: 6px;
					padding-inline: 10px;
					font-size: 0.8em;
					border-radius: 999px;
					box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
				}

				&:hover {
					> span {
						background: var(--panelHighlight);
					}
				}
			}
		}
	}

	&.max-width_380px,
	&.thin {
		> header {
			> .title {
				padding-block: 8px;
				padding-inline: 10px;
				font-size: 0.9em;
			}
		}

		> .content {
		}
	}
}

._forceContainerFull_ .ukygtjoj {
	> header {
		> .title {
			padding: 12px 16px !important;
		}
	}
}

._forceContainerFull_.ukygtjoj {
	> header {
		> .title {
			padding: 12px 16px !important;
		}
	}
}
</style>
