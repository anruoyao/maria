<template>
	<time :title="absolute">
		<template v-if="invalid">{{ i18n.ts._ago.invalid }}</template>
		<template v-else-if="mode === 'relative'">{{ relative }}</template>
		<template v-else-if="mode === 'absolute'">{{ absolute }}</template>
		<template v-else-if="mode === 'detail'"
			>{{ absolute }} ({{ relative }})</template
		>
	</time>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { i18n } from "@/i18n";
import { dateTimeFormat } from "@/scripts/intl-const";

const props = withDefaults(
	defineProps<{
		time: Date | string | number | null;
		origin?: Date | null;
		mode?: "relative" | "absolute" | "detail";
	}>(),
	{
		mode: "relative",
	},
);

function getDateSafe(n: Date | string | number) {
	try {
		if (n instanceof Date) {
			return n;
		}
		return new Date(n);
	} catch (err) {
		return {
			getTime: () => Number.NaN,
		};
	}
}

const _time = computed(() =>
	props.time == null ? Number.NaN : getDateSafe(props.time).getTime(),
);
const invalid = computed(() => Number.isNaN(_time.value));
const absolute = computed(() =>
	!invalid.value ? dateTimeFormat.format(_time.value) : i18n.ts._ago.invalid,
);

const now = ref(props.origin?.getTime() ?? Date.now());

const relative = computed<string>(() => {
	if (props.mode === "absolute") return ""; // absoluteではrelativeを使わないので計算しない
	if (invalid.value) return i18n.ts._ago.invalid;

	const time = Math.abs(now.value - _time.value) / 1000; /* ms */
	const agoOrLater = now.value > _time.value ? "_ago" : "_later";

	if (time >= 31536000) {
		return i18n.t(`${agoOrLater}.yearsAgo`, {
			n: Math.floor(time / 31536000).toString(),
		});
	}
	if (time >= 2592000) {
		return i18n.t(`${agoOrLater}.monthsAgo`, {
			n: Math.floor(time / 2592000).toString(),
		});
	}
	if (time >= 604800) {
		return i18n.t(`${agoOrLater}.weeksAgo`, {
			n: Math.floor(time / 604800).toString(),
		});
	}
	if (time >= 86400) {
		return i18n.t(`${agoOrLater}.daysAgo`, {
			n: Math.floor(time / 86400).toString(),
		});
	}
	if (time >= 3600) {
		return i18n.t(`${agoOrLater}.hoursAgo`, {
			n: Math.floor(time / 3600).toString(),
		});
	}
	if (time >= 60) {
		return i18n.t(`${agoOrLater}.minutesAgo`, {
			n: (~~(time / 60)).toString(),
		});
	}
	if (time >= 10) {
		return i18n.t(`${agoOrLater}.secondsAgo`, {
			n: (~~(time % 60)).toString(),
		});
	}
	if (time >= -1) {
		return i18n.ts[agoOrLater].justNow;
	}
	return i18n.ts[agoOrLater].future;
});

let tickId: number | undefined;

function tick(forceUpdateTicker = false) {
	if (
		invalid.value ||
		props.origin ||
		(props.mode !== "relative" && props.mode !== "detail")
	) {
		if (tickId) window.clearInterval(tickId);
		tickId = undefined;
		return;
	}

	const _now = Date.now();
	const currentInterval = (now.value - _time.value) / 1000; /* ms */

	now.value = _now;

	const newInterval = (now.value - _time.value) / 1000; /* ms */
	const prev =
		currentInterval < 60 ? 10000 : currentInterval < 3600 ? 60000 : 180000;
	const next = newInterval < 60 ? 10000 : newInterval < 3600 ? 60000 : 180000;

	if (!tickId) {
		tickId = window.setInterval(tick, next);
	} else if (prev < next || forceUpdateTicker) {
		window.clearInterval(tickId);
		tickId = window.setInterval(tick, next);
	}
}

watch(
	() => props.time,
	() => tick(true),
);

onMounted(() => {
	tick();
});

onUnmounted(() => {
	if (tickId) window.clearInterval(tickId);
});
</script>
