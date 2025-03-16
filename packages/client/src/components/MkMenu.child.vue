<template>
	<div ref="el" class="sfhdhdhr" tabindex="-1">
		<MkMenu
			ref="menu"
			:items="items"
			:align="align"
			:width="width"
			:as-drawer="false"
			@close="onChildClosed"
		/>
	</div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from "vue";
import MkMenu from "./MkMenu.vue";
import type { MenuItem } from "@/types/menu";

const props = defineProps<{
	items: MenuItem[];
	targetElement: HTMLElement;
	rootElement: HTMLElement;
	width?: number;
	viaKeyboard?: boolean;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
	(ev: "actioned"): void;
}>();

const el = ref<HTMLElement>();
const align = "left";

function setPosition() {
	const rootRect = props.rootElement.getBoundingClientRect();
	const rect = props.targetElement.getBoundingClientRect();
	const isRtl = getComputedStyle(props.rootElement).direction === "rtl";
	const writingMode = getComputedStyle(props.rootElement)["writing-mode"];
	const isVertical = writingMode.startsWith("vertical");
	const targetInlineSize = isVertical
		? props.targetElement.offsetHeight
		: props.targetElement.offsetWidth;
	const rectInlineSize = isVertical ? rect.height : rect.width;
	const windowInlineSize = isVertical ? window.innerHeight : window.innerWidth;
	const rootInsetInlineStart =
		isRtl && isVertical
			? rootRect.bottom
			: !isRtl && isVertical
				? rootRect.top
				: isRtl && !isVertical
					? rootRect.right
					: rootRect.left;
	const rectInsetInlineStart =
		isRtl && isVertical
			? rect.bottom
			: !isRtl && isVertical
				? rect.top
				: isRtl && !isVertical
					? rect.right
					: rect.left;

	let insetInlineStart = targetInlineSize;
	if (
		rootInsetInlineStart + insetInlineStart >
		windowInlineSize - rectInlineSize
	) {
		insetInlineStart = -rectInlineSize;
	}
	if (rectInsetInlineStart + insetInlineStart < 0) {
		insetInlineStart = -rectInsetInlineStart;
	}

	const insetBlockStart =
		writingMode === "vertical-rl"
			? rootRect.right - rect.right - 8
			: writingMode === "vertical-lr"
				? rootRect.left - rect.left - 8
				: writingMode === "horizontal-bt"
					? rect.right - rootRect.right - 8
					: rect.top - rootRect.top - 8;
	el.value!.style.insetInlineStart = `${insetInlineStart}px`;
	el.value!.style.insetBlockStart = `${insetBlockStart}px`;
}

function onChildClosed(actioned?: boolean) {
	if (actioned) {
		emit("actioned");
	} else {
		emit("closed");
	}
}

onMounted(() => {
	setPosition();
	nextTick(() => {
		setPosition();
	});
});

watch(
	() => props.items,
	() => {
		nextTick(() => {
			setPosition();
		});
	},
);

defineExpose({
	checkHit: (ev: MouseEvent) => {
		return ev.target === el.value || el.value?.contains(ev.target as Node);
	},
});
</script>

<style lang="scss" scoped>
.sfhdhdhr {
	position: absolute;
}
</style>
