<template>
	<Transition
		:name="transitionName"
		:enter-active-class="
			$style['transition_' + transitionName + '_enterActive']
		"
		:leave-active-class="
			$style['transition_' + transitionName + '_leaveActive']
		"
		:enter-from-class="
			$style['transition_' + transitionName + '_enterFrom']
		"
		:leave-to-class="$style['transition_' + transitionName + '_leaveTo']"
		:duration="transitionDuration"
		appear
		@after-leave="emit('closed')"
		@keyup.esc="emit('click')"
		@enter="emit('opening')"
		@after-enter="onOpened"
	>
		<FocusTrap
			v-model:active="isActive"
			:return-focus-on-deactivate="!noReturnFocus"
		>
			<div
				v-show="manualShowing != null ? manualShowing : showing"
				v-hotkey.global="keymap"
				v-focus
				:class="[
					$style.root,
					{
						[$style.drawer]: type === 'drawer',
						[$style.dialog]:
							type === 'dialog' || type === 'dialog:top',
						[$style.popup]: type === 'popup',
					},
				]"
				:style="{
					zIndex,
					pointerEvents: (
						manualShowing != null ? manualShowing : showing
					)
						? 'auto'
						: 'none',
					'--transformOrigin': transformOrigin,
				}"
				tabindex="-1"
			>
				<div
					class="_modalBg data-cy-bg"
					:class="[
						$style.bg,
						{
							[$style.bgTransparent]: isEnableBgTransparent,
							'data-cy-transparent': isEnableBgTransparent,
						},
					]"
					:style="{ zIndex }"
					@click="onBgClick"
					@mousedown="onBgClick"
					@contextmenu.prevent.stop="() => {}"
				></div>
				<div
					ref="content"
					:class="[
						$style.content,
						{ [$style.fixed]: fixed, top: type === 'dialog:top' },
					]"
					:style="{ zIndex }"
					@click.self="onBgClick"
				>
					<slot :max-height="maxHeight" :type="type"></slot>
				</div>
			</div>
		</FocusTrap>
	</Transition>
</template>

<script lang="ts" setup>
import {
	computed,
	nextTick,
	onMounted,
	onUnmounted,
	provide,
	ref,
	shallowRef,
	watch,
} from "vue";
import { FocusTrap } from "focus-trap-vue";
import * as os from "@/os";
import { isTouchUsing } from "@/scripts/touch";
import { defaultStore } from "@/store";
import { deviceKind } from "@/scripts/device-kind";

function getFixedContainer(el: Element | null): Element | null {
	if (el == null || el.tagName === "BODY") return null;
	const position = window.getComputedStyle(el).getPropertyValue("position");
	if (position === "fixed") {
		return el;
	} else {
		return getFixedContainer(el.parentElement);
	}
}

type ModalTypes = "popup" | "dialog" | "dialog:top" | "drawer";

const props = withDefaults(
	defineProps<{
		manualShowing?: boolean | null;
		anchor?: {
			x: "left" | "center" | "right";
			y: "top" | "center" | "bottom";
		};
		src?: HTMLElement | null;
		preferType?: ModalTypes | "auto";
		zPriority?: "low" | "middle" | "high";
		noOverlap?: boolean;
		transparentBg?: boolean;
		noReturnFocus?: boolean;
	}>(),
	{
		manualShowing: null,
		src: null,
		anchor: () => ({ x: "center", y: "bottom" }),
		preferType: "auto",
		zPriority: "low",
		noOverlap: true,
		transparentBg: false,
		noReturnFocus: false,
	},
);

const emit = defineEmits<{
	(ev: "opening"): void;
	(ev: "opened"): void;
	(ev: "click"): void;
	(ev: "esc"): void;
	(ev: "close"): void;
	(ev: "closed"): void;
}>();

provide("modal", true);

// FIXME: this may not used
const isActive = ref();

const maxHeight = ref<number>();
const fixed = ref(false);
const transformOrigin = ref("center");
const showing = ref(true);
const content = shallowRef<HTMLElement>();
const zIndex = os.claimZIndex(props.zPriority);
const useSendAnime = ref(false);
const type = computed<ModalTypes>(() => {
	if (props.preferType === "auto") {
		if (
			!defaultStore.state.disableDrawer &&
			isTouchUsing &&
			deviceKind === "smartphone"
		) {
			return "drawer";
		} else {
			return props.src != null ? "popup" : "dialog";
		}
	} else {
		return props.preferType!;
	}
});
const isEnableBgTransparent = computed(
	() => props.transparentBg && type.value === "popup",
);
const transitionName = computed(() =>
	defaultStore.state.animation
		? useSendAnime.value
			? "send"
			: type.value === "drawer"
				? "modal-drawer"
				: type.value === "popup"
					? "modal-popup"
					: "modal"
		: "",
);
const transitionDuration = computed(() =>
	transitionName.value === "send"
		? 400
		: transitionName.value === "modal-popup"
			? 100
			: transitionName.value === "modal"
				? 200
				: transitionName.value === "modal-drawer"
					? 200
					: 0,
);

let contentClicking = false;

const focusedElement = document.activeElement as HTMLElement;
function close(_ev?, opts: { useSendAnimation?: boolean } = {}) {
	// removeEventListener("popstate", close);
	// if (props.preferType == "dialog") {
	// 	history.forward();
	// }
	if (opts.useSendAnimation) {
		useSendAnime.value = true;
	}

	// eslint-disable-next-line vue/no-mutating-props
	if (props.src) props.src.style.pointerEvents = "auto";
	showing.value = false;
	emit("close");
	if (!props.noReturnFocus) {
		focusedElement?.focus();
	}
}

function onBgClick() {
	if (contentClicking) return;
	emit("click");
}

if (type.value === "drawer") {
	maxHeight.value = window.innerHeight / 1.5;
	if (
		getComputedStyle(document.documentElement)["writing-mode"].startsWith(
			"vertical",
		)
	) {
		maxHeight.value = window.innerHeight / 1.5;
	}
}

const keymap = {
	esc: () => emit("esc"),
};

const MARGIN = 16;

const align = () => {
	if (props.src == null) return;
	if (type.value === "drawer") return;
	if (type.value === "dialog") return;

	if (content.value == null) return;

	const srcRect = props.src.getBoundingClientRect();

	const width = content.value!.offsetWidth;
	const height = content.value!.offsetHeight;

	let left = 0;
	let top = MARGIN;

	const x = srcRect.left + (fixed.value ? 0 : window.scrollX);
	const y = srcRect.top + (fixed.value ? 0 : window.scrollY);

	let { x: anchorX, y: anchorY } = props.anchor;

	const styles = getComputedStyle(props.src);
	const direction = styles.direction;
	const writingMode = styles["writing-mode"];

	if (direction === "rtl") {
		if (anchorX === "right") {
			anchorX = "left";
		} else if (anchorX === "left") {
			anchorX = "right";
		}
	}

	if (writingMode.startsWith("vertical")) {
		const prevAnchorX = anchorX;
		const prevAnchorY = anchorY;
		if (prevAnchorX === "left") {
			anchorY = "top";
		} else if (prevAnchorX === "right") {
			anchorY = "bottom";
		} else if (prevAnchorX === "center") {
			anchorY = "top";
		}
		if (writingMode === "vertical-rl") {
			if (prevAnchorY === "top") {
				anchorX = "right";
			} else if (prevAnchorY === "bottom") {
				anchorX = "left";
			} else if (prevAnchorY === "center") {
				anchorX = "center";
			}
		} else if (writingMode === "vertical-lr") {
			if (prevAnchorY === "top") {
				anchorX = "left";
			} else if (prevAnchorY === "bottom") {
				anchorX = "right";
			} else if (prevAnchorY === "center") {
				anchorX = "center";
			}
		}
	}

	if (anchorX === "center") {
		left = x + props.src.offsetWidth / 2 - width / 2;
	} else if (anchorX === "left") {
		left = x - width;
	} else if (anchorX === "right") {
		left = x + props.src.offsetWidth;
	}

	if (anchorY === "center") {
		top = y - height / 2;
	} else if (anchorY === "top") {
		top = y;
	} else if (anchorY === "bottom") {
		top = y + props.src.offsetHeight;
	}

	const isVertical = writingMode.startsWith("vertical");
	const windowBlockSize = isVertical ? window.innerWidth : window.innerHeight;
	const windowScrollBlock = isVertical ? window.scrollX : window.scrollY;
	const insetBlockStart =
		writingMode === "vertical-rl"
			? windowBlockSize - left - width
			: writingMode === "vertical-lr"
				? left
				: top;
	const insetBlockEnd =
		writingMode === "vertical-rl"
			? windowBlockSize - left
			: writingMode === "vertical-lr"
				? left + width
				: top + height;
	const blockSize = isVertical ? width : height;
	const srcRectBlockStart =
		writingMode === "vertical-rl"
			? srcRect.right
			: writingMode === "vertical-lr"
				? srcRect.left
				: srcRect.top;

	if (fixed.value) {
		// 画面から横にはみ出る場合
		if (left + width > window.innerWidth) {
			left = window.innerWidth - width;
		}

		const underSpace = window.innerHeight - MARGIN - top;
		const upperSpace = srcRect.top - MARGIN;

		// 画面から縦にはみ出る場合
		if (top + height > window.innerHeight - MARGIN) {
			if (props.noOverlap && anchorX === "center") {
				if (underSpace < upperSpace / 3) {
					top = upperSpace + MARGIN - height;
				}
			} else {
				top = window.innerHeight - MARGIN - height;
			}
		}

		const blockEndSpace = windowBlockSize - MARGIN - insetBlockStart;
		const blockStartSpace = srcRectBlockStart - MARGIN;

		if (
			insetBlockEnd > windowBlockSize - MARGIN ||
			blockSize > windowBlockSize - MARGIN
		) {
			if (props.noOverlap) {
				if (blockEndSpace >= blockStartSpace / 3) {
					maxHeight.value = blockEndSpace;
				} else {
					maxHeight.value = blockStartSpace;
				}
			}
		}
	} else {
		// 画面から横にはみ出る場合
		if (left + width - window.scrollX > window.innerWidth) {
			left = window.innerWidth - width + window.scrollX - 1;
		}

		const underSpace = window.innerHeight - MARGIN - (top - window.scrollY);
		const upperSpace = srcRect.top - MARGIN;

		// 画面から縦にはみ出る場合
		if (top + height - window.scrollY > window.innerHeight - MARGIN) {
			if (props.noOverlap && anchorX === "center") {
				if (underSpace < upperSpace / 3) {
					top = window.scrollY + (upperSpace + MARGIN - height);
				}
			} else {
				top = window.innerHeight - MARGIN - height + window.scrollY - 1;
			}
		}

		const blockEndSpace =
			windowBlockSize - MARGIN - (insetBlockStart - windowScrollBlock);
		const blockStartSpace = srcRectBlockStart - MARGIN;

		// 画面から縦にはみ出る場合
		if (insetBlockEnd - windowScrollBlock > windowBlockSize - MARGIN) {
			if (props.noOverlap) {
				if (blockEndSpace >= blockStartSpace / 3) {
					maxHeight.value = blockEndSpace;
				} else {
					maxHeight.value = blockStartSpace;
				}
			}
		} else {
			maxHeight.value = blockEndSpace;
		}
	}

	if (top < 0) {
		top = MARGIN;
	}

	if (
		left > window.innerWidth - width - MARGIN &&
		writingMode !== "vertical-lr"
	) {
		left = window.innerWidth - width - MARGIN;
	}
	if (left < 0 && writingMode !== "vertical-rl") {
		left = 0;
	}

	let transformOriginX = "center";
	let transformOriginY = "center";

	if (
		top >=
		srcRect.top + props.src.offsetHeight + (fixed.value ? 0 : window.scrollY)
	) {
		transformOriginY = "top";
	} else if (top + height <= srcRect.top + (fixed.value ? 0 : window.scrollY)) {
		transformOriginY = "bottom";
	}

	if (
		left >=
		srcRect.left + props.src.offsetWidth + (fixed.value ? 0 : window.scrollX)
	) {
		transformOriginX = "left";
	} else if (
		left + width <=
		srcRect.left + (fixed.value ? 0 : window.scrollX)
	) {
		transformOriginX = "right";
	}

	transformOrigin.value = `${transformOriginX} ${transformOriginY}`;

	content.value.style.left = `${left}px`;
	content.value.style.top = `${top}px`;
};

const onOpened = () => {
	emit("opened");

	// モーダルコンテンツにマウスボタンが押され、コンテンツ外でマウスボタンが離されたときにモーダルバックグラウンドクリックと判定させないためにマウスイベントを監視しフラグ管理する
	const el = content.value!.children[0];
	el.addEventListener(
		"mousedown",
		(ev) => {
			contentClicking = true;
			window.addEventListener(
				"mouseup",
				(ev) => {
					// click イベントより先に mouseup イベントが発生するかもしれないのでちょっと待つ
					window.setTimeout(() => {
						contentClicking = false;
					}, 100);
				},
				{ passive: true, once: true },
			);
		},
		{ passive: true },
	);
	// if (props.preferType == "dialog") {
	// 	history.pushState(null, "", location.href);
	// }
	// addEventListener("popstate", close);
};

onMounted(() => {
	watch(
		() => props.src,
		async () => {
			if (props.src) {
				// eslint-disable-next-line vue/no-mutating-props
				props.src.style.pointerEvents = "none";
			}
			fixed.value =
				type.value === "drawer" || getFixedContainer(props.src) != null;

			await nextTick();

			align();
		},
		{ immediate: true },
	);

	nextTick(() => {
		new ResizeObserver((entries, observer) => {
			align();
		}).observe(content.value!);
	});
});
onUnmounted(() => {
	// removeEventListener("popstate", close);
	// if (props.preferType == "dialog") {
	// 	history.back();
	// }
});

defineExpose({
	close,
});
</script>

<style lang="scss" module>
.transition_send_enterActive,
.transition_send_leaveActive {
	> .bg {
		transition: opacity 0.3s !important;
	}

	> .content {
		transform: translateY(0px);
		transition:
			opacity 0.3s ease-in,
			transform 0.3s cubic-bezier(0.5, -0.5, 1, 0.5) !important;
	}
}
.transition_send_enterFrom,
.transition_send_leaveTo {
	> .bg {
		opacity: 0;
	}

	> .content {
		pointer-events: none;
		opacity: 0;
		transform: translateY(-300px);
	}
}

.transition_modal_enterActive,
.transition_modal_leaveActive {
	> .bg {
		transition: opacity 0.2s !important;
	}

	> .content {
		transform-origin: var(--transformOrigin);
		transition:
			opacity 0.2s,
			transform 0.2s !important;
	}
}
.transition_modal_enterFrom,
.transition_modal_leaveTo {
	> .bg {
		opacity: 0;
	}

	> .content {
		pointer-events: none;
		opacity: 0;
		transform-origin: var(--transformOrigin);
		transform: scale(0.9);
	}
}

.transition_modal-popup_enterActive,
.transition_modal-popup_leaveActive {
	> .bg {
		transition: opacity 0.2s !important;
	}

	> .content {
		transform-origin: var(--transformOrigin);
		transition:
			opacity 0.2s cubic-bezier(0, 0, 0.2, 1),
			transform 0.2s cubic-bezier(0, 0, 0.2, 1) !important;
	}
}
.transition_modal-popup_enterFrom,
.transition_modal-popup_leaveTo {
	> .bg {
		opacity: 0;
	}

	> .content {
		pointer-events: none;
		opacity: 0;
		transform-origin: var(--transformOrigin);
		transform: scale(0.9);
	}
}

.transition_modal-drawer_enterActive {
	> .bg {
		transition: opacity 0.2s !important;
	}

	> .content {
		transition: transform 0.2s cubic-bezier(0, 0.5, 0, 1) !important;
	}
}
.transition_modal-drawer_leaveActive {
	> .bg {
		transition: opacity 0.2s !important;
	}

	> .content {
		transition: transform 0.2s cubic-bezier(0, 0.5, 0, 1) !important;
	}
}
.transition_modal-drawer_enterFrom,
.transition_modal-drawer_leaveTo {
	> .bg {
		opacity: 0;
	}

	> .content {
		pointer-events: none;
		transform: translateY(100%);
	}
}

.root {
	outline: none;
	&.dialog {
		> .content {
			position: fixed;
			inset: 0;
			margin: auto;
			padding: 16px;
			// TODO: mask-imageはiOSだとやたら重い。なんとかしたい
			-webkit-mask-image: linear-gradient(
				var(--gradient-to-block-start),
				rgba(0, 0, 0, 0) 0%,
				rgba(0, 0, 0, 1) 16px,
				rgba(0, 0, 0, 1) calc(100% - 16px),
				rgba(0, 0, 0, 0) 100%
			);
			mask-image: linear-gradient(
				var(--gradient-to-block-start),
				rgba(0, 0, 0, 0) 0%,
				rgba(0, 0, 0, 1) 16px,
				rgba(0, 0, 0, 1) calc(100% - 16px),
				rgba(0, 0, 0, 0) 100%
			);
			overflow: auto;
			display: flex;

			@media (max-inline-size: 500px) {
				padding: 16px;
				-webkit-mask-image: linear-gradient(
					var(--gradient-to-block-start),
					rgba(0, 0, 0, 0) 0%,
					rgba(0, 0, 0, 1) 16px,
					rgba(0, 0, 0, 1) calc(100% - 16px),
					rgba(0, 0, 0, 0) 100%
				);
				mask-image: linear-gradient(
					var(--gradient-to-block-start),
					rgba(0, 0, 0, 0) 0%,
					rgba(0, 0, 0, 1) 16px,
					rgba(0, 0, 0, 1) calc(100% - 16px),
					rgba(0, 0, 0, 0) 100%
				);
			}

			> ::v-deep(*) {
				margin: auto;
			}

			&.top {
				> ::v-deep(*) {
					margin-block-start: 0;
				}
			}
		}
	}

	&.popup {
		> .content {
			position: absolute;

			&.fixed {
				position: fixed;
			}
		}
	}

	&.drawer {
		position: fixed;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 100%;
		block-size: 100%;
		overflow: clip;

		> .content {
			position: fixed;
			inset-block-end: 0;
			inset-inline-start: 0;
			inset-inline-end: 0;
			margin: auto;

			> ::v-deep(*) {
				margin: auto;
			}
		}
	}
}

.bg {
	&.bgTransparent {
		background: transparent;
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}
}
</style>
