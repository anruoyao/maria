<template>
	<transition
		:name="defaultStore.state.animation ? 'tooltip' : ''"
		appear
		@after-leave="emit('closed')"
	>
		<div
			v-show="showing"
			ref="el"
			class="buebdbiu _acrylic _shadow"
			:style="{ zIndex, maxWidth: maxWidth + 'px' }"
		>
			<slot>
				<Mfm v-if="asMfm" :text="text!" />
				<span v-else>{{ text }}</span>
			</slot>
		</div>
	</transition>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import * as os from "@/os";
import { calcPopupPosition } from "@/scripts/popup-position";
import { defaultStore } from "@/store";

const props = withDefaults(
	defineProps<{
		showing: boolean;
		targetElement?: HTMLElement | null;
		x?: number;
		y?: number;
		text?: string;
		asMfm?: boolean;
		maxWidth?: number;
		direction?: "top" | "bottom" | "right" | "left";
		innerMargin?: number;
	}>(),
	{
		maxWidth: 250,
		direction: "top",
		innerMargin: 0,
		targetElement: null,
	},
);

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

const el = ref<HTMLElement>();
const zIndex = os.claimZIndex("high");

function setPosition() {
	let direction = props.direction;
	if (getComputedStyle(el.value!).direction === "rtl") {
		if (direction === "right") {
			direction = "left";
		} else if (direction === "left") {
			direction = "right";
		}
	}
	if (getComputedStyle(el.value!)["writing-mode"].startsWith("vertical")) {
		if (direction === "top") {
			direction = "right";
		} else if (direction === "bottom") {
			direction = "left";
		} else if (direction === "right") {
			direction = "bottom";
		} else if (direction === "left") {
			direction = "top";
		}
	}
	const data = calcPopupPosition(el.value!, {
		anchorElement: props.targetElement,
		direction: direction,
		align: "center",
		innerMargin: props.innerMargin,
		x: props.x,
		y: props.y,
	});

	el.value!.style.transformOrigin = data.transformOrigin;
	el.value!.style.left = `${data.left}px`;
	el.value!.style.top = `${data.top}px`;
}

let loopHandler: number;

onMounted(() => {
	nextTick(() => {
		setPosition();

		const loop = () => {
			loopHandler = window.requestAnimationFrame(() => {
				setPosition();
				loop();
			});
		};

		loop();
	});
});

onUnmounted(() => {
	window.cancelAnimationFrame(loopHandler);
});
</script>

<style lang="scss" scoped>
.tooltip-enter-active,
.tooltip-leave-active {
	opacity: 1;
	transform: scale(1);
	transition:
		transform 200ms cubic-bezier(0.23, 1, 0.32, 1),
		opacity 200ms cubic-bezier(0.23, 1, 0.32, 1);
}
.tooltip-enter-from,
.tooltip-leave-active {
	opacity: 0;
	transform: scale(0.75);
}

.buebdbiu {
	position: absolute;
	font-size: 0.8em;
	padding-block: 8px;
	padding-inline: 12px;
	box-sizing: border-box;
	text-align: center;
	border-radius: 4px;
	border: solid 0.5px var(--divider);
	pointer-events: none;
	transform-origin: center center;
}
</style>
