<template>
	<div class="lcfyofjk">
		<svg :viewBox="`0 0 ${viewBoxX} ${viewBoxY}`">
			<defs>
				<linearGradient :id="cpuGradientId" x1="0" x2="0" y1="1" y2="0">
					<stop offset="0%" stop-color="hsl(189, 43%, 73%)"></stop>
					<stop offset="100%" stop-color="hsl(343, 76%, 68%)"></stop>
				</linearGradient>
				<mask
					:id="cpuMaskId"
					x="0"
					y="0"
					:width="viewBoxX"
					:height="viewBoxY"
				>
					<polygon
						:points="cpuPolygonPoints"
						fill="#fff"
						fill-opacity="0.5"
					/>
					<polyline
						:points="cpuPolylinePoints"
						fill="none"
						stroke="#fff"
						stroke-width="1"
					/>
					<circle :cx="cpuHeadX" :cy="cpuHeadY" r="1.5" fill="#fff" />
				</mask>
			</defs>
			<rect
				x="-2"
				y="-2"
				:width="viewBoxX + 4"
				:height="viewBoxY + 4"
				:style="`stroke: none; fill: url(#${cpuGradientId}); mask: url(#${cpuMaskId})`"
			/>
			<text x="1" y="5">
				CPU
				<tspan>{{ cpuUsage }}%</tspan>
			</text>
		</svg>
		<svg :viewBox="`0 0 ${viewBoxX} ${viewBoxY}`">
			<defs>
				<linearGradient :id="memGradientId" x1="0" x2="0" y1="1" y2="0">
					<stop offset="0%" stop-color="hsl(189, 43%, 73%)"></stop>
					<stop offset="100%" stop-color="hsl(343, 76%, 68%)"></stop>
				</linearGradient>
				<mask
					:id="memMaskId"
					x="0"
					y="0"
					:width="viewBoxX"
					:height="viewBoxY"
				>
					<polygon
						:points="memPolygonPoints"
						fill="#fff"
						fill-opacity="0.5"
					/>
					<polyline
						:points="memPolylinePoints"
						fill="none"
						stroke="#fff"
						stroke-width="1"
					/>
					<circle :cx="memHeadX" :cy="memHeadY" r="1.5" fill="#fff" />
				</mask>
			</defs>
			<rect
				x="-2"
				y="-2"
				:width="viewBoxX + 4"
				:height="viewBoxY + 4"
				:style="`stroke: none; fill: url(#${memGradientId}); mask: url(#${memMaskId})`"
			/>
			<text x="1" y="5">
				MEM
				<tspan>{{ memUsage }}%</tspan>
			</text>
		</svg>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { v4 as uuid } from "uuid";

const props = defineProps<{
	connection: any;
}>();

const viewBoxX = ref(50);
const viewBoxY = ref(30);
const stats = ref<any[]>([]);
const cpuGradientId = uuid();
const cpuMaskId = uuid();
const memGradientId = uuid();
const memMaskId = uuid();
const cpuPolylinePoints = ref("");
const memPolylinePoints = ref("");
const cpuPolygonPoints = ref("");
const memPolygonPoints = ref("");
const cpuHeadX = ref<number>();
const cpuHeadY = ref<number>();
const memHeadX = ref<number>();
const memHeadY = ref<number>();
const cpuUsage = ref<string>();
const memUsage = ref<string>();

onMounted(() => {
	props.connection.on("stats", onStats);
	props.connection.on("statsLog", onStatsLog);
	props.connection.send("requestLog", {
		id: Math.random().toString().substring(2, 10),
	});
});

onBeforeUnmount(() => {
	props.connection.off("stats", onStats);
	props.connection.off("statsLog", onStatsLog);
});

function onStats(connStats) {
	stats.value.push(connStats);
	if (stats.value.length > 50) stats.value.shift();

	const cpuPolylinePointsStats = stats.value.map((s, i) => [
		viewBoxX.value - (stats.value.length - 1 - i),
		(1 - s.cpu / 100) * viewBoxY.value,
	]);
	const memPolylinePointsStats = stats.value.map((s, i) => [
		viewBoxX.value - (stats.value.length - 1 - i),
		(1 - s.mem.used / s.mem.total) * viewBoxY.value,
	]);
	cpuPolylinePoints.value = cpuPolylinePointsStats
		.map((xy) => `${xy[0]},${xy[1]}`)
		.join(" ");
	memPolylinePoints.value = memPolylinePointsStats
		.map((xy) => `${xy[0]},${xy[1]}`)
		.join(" ");

	cpuPolygonPoints.value = `${viewBoxX.value - (stats.value.length - 1)},${
		viewBoxY.value
	} ${cpuPolylinePoints.value} ${viewBoxX.value},${viewBoxY.value}`;
	memPolygonPoints.value = `${viewBoxX.value - (stats.value.length - 1)},${
		viewBoxY.value
	} ${memPolylinePoints.value} ${viewBoxX.value},${viewBoxY.value}`;

	cpuHeadX.value = cpuPolylinePointsStats[cpuPolylinePointsStats.length - 1][0];
	cpuHeadY.value = cpuPolylinePointsStats[cpuPolylinePointsStats.length - 1][1];
	memHeadX.value = memPolylinePointsStats[memPolylinePointsStats.length - 1][0];
	memHeadY.value = memPolylinePointsStats[memPolylinePointsStats.length - 1][1];

	cpuUsage.value = connStats.cpu.toFixed(1);
	memUsage.value = ((connStats.mem.used / connStats.mem.total) * 100).toFixed(
		1,
	);
}

function onStatsLog(statsLog) {
	for (const revStats of [...statsLog].reverse()) {
		onStats(revStats);
	}
}
</script>

<style lang="scss" scoped>
.lcfyofjk {
	display: flex;

	> svg {
		display: block;
		padding: 10px;
		inline-size: 50%;

		&:first-child {
			padding-inline-end: 5px;
		}

		&:last-child {
			padding-inline-start: 5px;
		}

		> text {
			font-size: 5px;
			fill: currentColor;

			> tspan {
				opacity: 0.5;
			}
		}
	}
}
</style>
