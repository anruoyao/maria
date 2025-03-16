<template>
	<div class="cbbedffa">
		<canvas ref="chartEl"></canvas>
		<div v-if="fetching" class="fetching">
			<MkLoading />
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";
import { onMounted, ref, watch } from "vue";
import {
	ArcElement,
	BarController,
	BarElement,
	CategoryScale,
	Chart,
	Filler,
	Legend,
	LineController,
	LineElement,
	LinearScale,
	PointElement,
	SubTitle,
	TimeScale,
	Title,
	Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";
import zoomPlugin from "chartjs-plugin-zoom";
// https://github.com/misskey-dev/misskey/pull/8575#issuecomment-1114242002
// We can't use gradient because Vite throws a error.
// import gradient from 'chartjs-plugin-gradient';
import * as os from "@/os";
import { defaultStore } from "@/store";
import { useChartTooltip } from "@/scripts/use-chart-tooltip";

const props = defineProps({
	src: {
		type: String,
		required: true,
	},
	args: {
		type: Object,
		required: false,
	},
	limit: {
		type: Number,
		required: false,
		default: 90,
	},
	span: {
		type: String as PropType<"hour" | "day">,
		required: true,
	},
	detailed: {
		type: Boolean,
		required: false,
		default: false,
	},
	stacked: {
		type: Boolean,
		required: false,
		default: false,
	},
	bar: {
		type: Boolean,
		required: false,
		default: false,
	},
	aspectRatio: {
		type: Number,
		required: false,
		default: null,
	},
});

Chart.register(
	ArcElement,
	LineElement,
	BarElement,
	PointElement,
	BarController,
	LineController,
	CategoryScale,
	LinearScale,
	TimeScale,
	Legend,
	Title,
	Tooltip,
	SubTitle,
	Filler,
	zoomPlugin,
	// gradient,
);

const sum = (...arr) => arr.reduce((r, a) => r.map((b, i) => a[i] + b));
const negate = (arr) => arr.map((x) => -x);
const alpha = (hex, a) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
	const r = Number.parseInt(result[1], 16);
	const g = Number.parseInt(result[2], 16);
	const b = Number.parseInt(result[3], 16);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const colors = {
	blue: "#31748f",
	green: "#9ccfd8",
	yellow: "#f6c177",
	red: "#eb6f92",
	purple: "#c4a7e7",
	orange: "#ebbcba",
	lime: "#56949f",
	cyan: "#9ccfd8",
};
const colorSets = [
	colors.blue,
	colors.green,
	colors.yellow,
	colors.red,
	colors.purple,
];
const getColor = (i) => {
	return colorSets[i % colorSets.length];
};

const now = new Date();
let chartInstance: Chart = null;
let chartData: {
	series: {
		name: string;
		type: "line" | "area";
		color?: string;
		dashed?: boolean;
		hidden?: boolean;
		data: {
			x: number;
			y: number;
		}[];
	}[];
} = null;

const chartEl = ref<HTMLCanvasElement>(null);
const fetching = ref(true);

const getDate = (ago: number) => {
	const y = now.getFullYear();
	const m = now.getMonth();
	const d = now.getDate();
	const h = now.getHours();

	return props.span === "day"
		? new Date(y, m, d - ago)
		: new Date(y, m, d, h - ago);
};

const format = (arr) => {
	return arr.map((v, i) => ({
		x: getDate(i).getTime(),
		y: v,
	}));
};

const { handler: externalTooltipHandler } = useChartTooltip();

const render = () => {
	if (chartInstance) {
		chartInstance.destroy();
	}

	const gridColor = defaultStore.state.darkMode
		? "rgba(255, 255, 255, 0.1)"
		: "rgba(0, 0, 0, 0.1)";
	const vLineColor = defaultStore.state.darkMode
		? "rgba(255, 255, 255, 0.2)"
		: "rgba(0, 0, 0, 0.2)";

	// フォントカラー
	Chart.defaults.color = getComputedStyle(
		document.documentElement,
	).getPropertyValue("--fg");

	// const maxes = chartData.series.map((x, i) =>
	// 	Math.max(...x.data.map((d) => d.y)),
	// );

	chartInstance = new Chart(chartEl.value, {
		type: props.bar ? "bar" : "line",
		data: {
			labels: new Array(props.limit)
				.fill(0)
				.map((_, i) => getDate(i).toLocaleString())
				.slice()
				.reverse(),
			datasets: chartData.series.map((x, i) => ({
				parsing: false,
				label: x.name,
				data: x.data.slice().reverse(),
				tension: 0.3,
				pointRadius: 0,
				borderWidth: props.bar ? 0 : 2,
				borderColor: x.color ? x.color : getColor(i),
				borderDash: x.dashed ? [5, 5] : [],
				borderJoinStyle: "round",
				borderRadius: props.bar ? 3 : undefined,
				backgroundColor: props.bar
					? x.color
						? x.color
						: getColor(i)
					: alpha(x.color ? x.color : getColor(i), 0.1),
				/* gradient: props.bar ? undefined : {
					backgroundColor: {
						axis: 'y',
						colors: {
							0: alpha(x.color ? x.color : getColor(i), 0),
							[maxes[i]]: alpha(x.color ? x.color : getColor(i), 0.2),
						},
					},
				}, */
				barPercentage: 0.9,
				categoryPercentage: 0.9,
				fill: x.type === "area",
				clip: 8,
				hidden: !!x.hidden,
			})),
		},
		options: {
			aspectRatio: props.aspectRatio || 2.5,
			layout: {
				padding: {
					left: 0,
					right: 8,
					top: 0,
					bottom: 0,
				},
			},
			scales: {
				x: {
					type: "time",
					stacked: props.stacked,
					offset: false,
					time: {
						stepSize: 1,
						unit: props.span === "day" ? "month" : "day",
					},
					grid: {
						color: gridColor,
						borderColor: "rgb(0, 0, 0, 0)",
					},
					ticks: {
						display: props.detailed,
						maxRotation: 0,
						autoSkipPadding: 16,
					},
					adapters: {
						date: {
							locale: enUS,
						},
					},
					min: getDate(props.limit).getTime(),
				},
				y: {
					position: "left",
					stacked: props.stacked,
					suggestedMax: 50,
					grid: {
						color: gridColor,
						borderColor: "rgb(0, 0, 0, 0)",
					},
					ticks: {
						display: props.detailed,
						// mirror: true,
					},
				},
			},
			interaction: {
				intersect: false,
				mode: "index",
			},
			elements: {
				point: {
					hoverRadius: 5,
					hoverBorderWidth: 2,
				},
			},
			animation: false,
			plugins: {
				legend: {
					display: props.detailed,
					position: "bottom",
					labels: {
						boxWidth: 16,
					},
				},
				tooltip: {
					enabled: false,
					mode: "index",
					animation: {
						duration: 0,
					},
					external: externalTooltipHandler,
				},
				zoom: props.detailed
					? {
							pan: {
								enabled: true,
							},
							zoom: {
								wheel: {
									enabled: true,
								},
								pinch: {
									enabled: true,
								},
								drag: {
									enabled: false,
								},
								mode: "x",
							},
							limits: {
								x: {
									min: "original",
									max: "original",
								},
								y: {
									min: "original",
									max: "original",
								},
							},
						}
					: undefined,
				// gradient,
			},
		},
		plugins: [
			{
				id: "vLine",
				beforeDraw(chart, args, options) {
					if (chart.tooltip?._active?.length) {
						const activePoint = chart.tooltip._active[0];
						const ctx = chart.ctx;
						const x = activePoint.element.x;
						const topY = chart.scales.y.top;
						const bottomY = chart.scales.y.bottom;

						ctx.save();
						ctx.beginPath();
						ctx.moveTo(x, bottomY);
						ctx.lineTo(x, topY);
						ctx.lineWidth = 1;
						ctx.strokeStyle = vLineColor;
						ctx.stroke();
						ctx.restore();
					}
				},
			},
		],
	});
};

const fetchActiveUsersChart = async (): Promise<typeof chartData> => {
	const raw = await os.apiGet("charts/active-users", {
		limit: props.limit,
		span: props.span,
	});
	return {
		series: [
			{
				name: "Read & Write",
				type: "area",
				data: format(raw.readWrite),
				color: colors.orange,
			},
			{
				name: "Write",
				type: "area",
				data: format(raw.write),
				color: colors.lime,
			},
			{
				name: "Read",
				type: "area",
				data: format(raw.read),
				color: colors.blue,
			},
			{
				name: "< Week",
				type: "area",
				data: format(raw.registeredWithinWeek),
				color: colors.green,
			},
			{
				name: "< Month",
				type: "area",
				data: format(raw.registeredWithinMonth),
				color: colors.yellow,
			},
			{
				name: "< Year",
				type: "area",
				data: format(raw.registeredWithinYear),
				color: colors.red,
			},
			{
				name: "> Week",
				type: "area",
				data: format(raw.registeredOutsideWeek),
				color: colors.yellow,
			},
			{
				name: "> Month",
				type: "area",
				data: format(raw.registeredOutsideMonth),
				color: colors.red,
			},
			{
				name: "> Year",
				type: "area",
				data: format(raw.registeredOutsideYear),
				color: colors.purple,
			},
		],
	};
};

const fetchAndRender = async () => {
	fetching.value = true;
	chartData = await fetchActiveUsersChart();
	fetching.value = false;
	render();
};

watch(() => [props.src, props.span], fetchAndRender);

onMounted(() => {
	fetchAndRender();
});
</script>

<style lang="scss" scoped>
.cbbedffa {
	position: relative;

	> .fetching {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 100%;
		block-size: 100%;
		-webkit-backdrop-filter: var(--blur, blur(12px));
		backdrop-filter: var(--blur, blur(12px));
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: wait;
	}
}
</style>
