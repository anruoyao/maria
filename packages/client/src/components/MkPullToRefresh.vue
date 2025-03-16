<template>
	<div ref="rootEl">
		<div
			v-if="pullStarted"
			:class="$style.frame"
			:style="`--frame-min-block-size: ${
				pullDistance /
				(PULL_BRAKE_BASE + pullDistance / PULL_BRAKE_FACTOR)
			}px;`"
		>
			<div :class="$style.frameContent">
				<i
					v-if="!isRefreshing"
					:class="[$style.icon, icon('ph-arrow-down ph-dir'), { [$style.refresh]: pullEnded }]"
				></i>
				<div :class="$style.text">
					<template v-if="pullEnded">{{
						i18n.ts.releaseToReload
					}}</template>
					<template v-else-if="isRefreshing">{{
						i18n.ts.reloading
					}}</template>
					<template v-else>{{ i18n.ts.pullDownToReload }}</template>
				</div>
			</div>
		</div>
		<div :class="{ [$style.slotClip]: pullStarted }">
			<slot />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, shallowRef } from "vue";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import { getScrollContainer } from "@/scripts/scroll";
import { isDuringHorizontalSwipe } from "@/scripts/touch";
import icon from "@/scripts/icon";

const SCROLL_STOP = 10;
const MAX_PULL_DISTANCE = Number.POSITIVE_INFINITY;
const FIRE_THRESHOLD = defaultStore.state.pullToRefreshThreshold;
const RELEASE_TRANSITION_DURATION = 200;
const PULL_BRAKE_BASE = 1.5;
const PULL_BRAKE_FACTOR = 170;
const MAX_PULL_TAN_ANGLE = Math.tan((1 / 6) * Math.PI); // 30°

const pullStarted = ref(false);
const pullEnded = ref(false);
const isRefreshing = ref(false);
const pullDistance = ref(0);

let disabled = false;
const supportPointerDesktop = false;
let startScreenY: number | null = null;
let startScreenX: number | null = null;

const rootEl = shallowRef<HTMLDivElement>();
let scrollEl: HTMLElement | null = null;

const props = withDefaults(
	defineProps<{
		refresher: () => Promise<void>;
	}>(),
	{
		refresher: () => Promise.resolve(),
	},
);

const emits = defineEmits<(ev: "refresh") => void>();

function getScreenY(event) {
	if (supportPointerDesktop) return event.screenY;
	return event.touches[0].screenY;
}
function getScreenX(event) {
	if (supportPointerDesktop) return event.screenX;
	return event.touches[0].screenX;
}

function moveStart(event) {
	if (!pullStarted.value && !isRefreshing.value && !disabled) {
		pullStarted.value = true;
		startScreenY = getScreenY(event);
		startScreenX = getScreenX(event);
		pullDistance.value = 0;
	}
}

function moveBySystem(to: number): Promise<void> {
	return new Promise((r) => {
		const initialHeight = pullDistance.value;
		const overHeight = pullDistance.value - to;
		if (overHeight < 1) {
			r();
			return;
		}
		const startTime = Date.now();
		const intervalId = setInterval(() => {
			const time = Date.now() - startTime;
			if (time > RELEASE_TRANSITION_DURATION) {
				pullDistance.value = to;
				clearInterval(intervalId);
				r();
				return;
			}
			const nextHeight =
				initialHeight - (overHeight / RELEASE_TRANSITION_DURATION) * time;
			if (pullDistance.value < nextHeight) return;
			pullDistance.value = nextHeight;
		}, 1);
	});
}

async function fixOverContent() {
	if (pullDistance.value > FIRE_THRESHOLD) await moveBySystem(FIRE_THRESHOLD);
}

async function closeContent() {
	if (pullDistance.value > 0) await moveBySystem(0);
}

function moveEnd() {
	if (pullStarted.value && !isRefreshing.value) {
		startScreenY = null;
		startScreenX = null;
		if (pullEnded.value) {
			pullEnded.value = false;
			isRefreshing.value = true;
			fixOverContent().then(() => {
				emits("refresh");
				props.refresher().then(() => {
					refreshFinished();
				});
			});
		} else {
			closeContent().then(() => (pullStarted.value = false));
		}
	}
}

function moving(event: TouchEvent | PointerEvent) {
	if (!pullStarted.value || isRefreshing.value || disabled) return;
	if (
		(scrollEl?.scrollTop ?? 0) >
			(supportPointerDesktop
				? SCROLL_STOP
				: SCROLL_STOP + pullDistance.value) ||
		isDuringHorizontalSwipe.value
	) {
		pullDistance.value = 0;
		pullEnded.value = false;
		moveEnd();
		return;
	}
	startScreenX ??= getScreenX(event);
	startScreenY ??= getScreenY(event);
	const moveScreenY = getScreenY(event);
	const moveScreenX = getScreenX(event);
	const moveHeight = moveScreenY - startScreenY!;
	const moveWidth = moveScreenX - startScreenX!;
	const writingMode = rootEl.value
		? getComputedStyle(rootEl.value)["writing-mode"]
		: "horizontal-tb";
	const moveScreenBlock =
		writingMode === "vertical-rl"
			? -moveWidth
			: writingMode === "vertical-lr"
				? moveWidth
				: moveHeight;
	const moveScreenInline = writingMode.startsWith("vertical")
		? moveHeight
		: moveWidth;

	if (Math.abs(moveScreenInline / moveScreenBlock) > MAX_PULL_TAN_ANGLE) {
		if (Math.abs(moveScreenInline) > 30) pullStarted.value = false;
		return;
	}

	pullDistance.value = Math.min(
		Math.max(moveScreenBlock, 0),
		MAX_PULL_DISTANCE,
	);

	if (pullDistance.value > 0) {
		if (event.cancelable) event.preventDefault();
	}

	if (pullDistance.value > SCROLL_STOP) {
		event.stopPropagation();
	}

	pullEnded.value = pullDistance.value >= FIRE_THRESHOLD;
}

function refreshFinished() {
	closeContent().then(() => {
		pullStarted.value = false;
		isRefreshing.value = false;
	});
}

function setDisabled(value) {
	disabled = value;
}

function onScrollContainerScroll() {
	const scrollPos = scrollEl!.scrollTop;

	// When at the top of the page, disable vertical overscroll so passive touch listeners can take over.
	if (scrollPos === 0) {
		scrollEl!.style.touchAction = "pan-x pan-down pinch-zoom";
		registerEventListenersForReadyToPull();
	} else {
		scrollEl!.style.touchAction = "auto";
		unregisterEventListenersForReadyToPull();
	}
}

function registerEventListenersForReadyToPull() {
	if (rootEl.value == null) return;
	rootEl.value.addEventListener("touchstart", moveStart, { passive: true });
	rootEl.value.addEventListener("touchmove", moving, { passive: false }); // setting passive to false to allow preventDefault
}

function unregisterEventListenersForReadyToPull() {
	if (rootEl.value == null) return;
	rootEl.value.removeEventListener("touchstart", moveStart);
	rootEl.value.removeEventListener("touchmove", moving);
}

onMounted(() => {
	if (rootEl.value == null) return;

	scrollEl = getScrollContainer(rootEl.value) ?? document.querySelector("HTML");
	if (scrollEl == null) return;

	scrollEl.addEventListener("scroll", onScrollContainerScroll, {
		passive: true,
	});

	rootEl.value.addEventListener("touchend", moveEnd, { passive: true });

	registerEventListenersForReadyToPull();
});

onUnmounted(() => {
	if (scrollEl) scrollEl.removeEventListener("scroll", onScrollContainerScroll);

	unregisterEventListenersForReadyToPull();
});

defineExpose({
	setDisabled,
});
</script>

<style lang="scss" module>
.frame {
	position: relative;
	overflow: clip;
	inline-size: 100%;
	min-block-size: var(--frame-min-block-size, 0px);
	mask-image: linear-gradient(var(--gradient-to-inline-end), #000 0%, #000 80%, transparent);
	-webkit-mask-image: -webkit-linear-gradient(
		var(--gradient-to-inline-end),
		#000 0%,
		#000 80%,
		transparent
	);
	pointer-events: none;
}
.frameContent {
	position: absolute;
	inset-block-end: 0;
	inline-size: 100%;
	margin-block: 5px;
	margin-inline: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 14px;
	> .icon,
	> .loader {
		margin-block: 6px;
		margin-inline: 0;
	}
	> .icon {
		transition: transform 0.25s;
		&.refresh {
			transform: rotate(180deg);
			:global(.vertical-rl) & {
				transform: rotate(-90deg);
			}
			:global(.vertical-lr) & {
				transform: rotate(90deg);
			}
		}
	}
	> .text {
		margin-block: 5px;
		margin-inline: 0;
	}
}
.slotClip {
	overflow-y: clip;
	overflow-block: clip;

	@supports not (overflow-block: clip) {
		.vertical-lr &, .vertical-rl & {
			overflow-y: visible;
			overflow-x: clip;
		}
	}
}
</style>
