import { onDeactivated, onUnmounted, ref } from "vue";
import type { Color, TooltipOptions } from "chart.js";
import * as os from "@/os";
import MkChartTooltip from "@/components/MkChartTooltip.vue";

interface ToolTipSerie {
	backgroundColor: Color;
	borderColor: Color;
	text: string;
}

export function useChartTooltip(
	opts: { position: "top" | "middle" } = { position: "top" },
) {
	const tooltipShowing = ref(false);
	const tooltipX = ref(0);
	const tooltipY = ref(0);
	const tooltipTitle = ref<string | null>(null);
	const tooltipSeries = ref<ToolTipSerie[] | null>(null);
	let disposeTooltipComponent: () => void;

	os.popup(
		MkChartTooltip,
		{
			showing: tooltipShowing,
			x: tooltipX,
			y: tooltipY,
			title: tooltipTitle,
			series: tooltipSeries,
		},
		{},
	).then(({ dispose }) => {
		disposeTooltipComponent = dispose;
	});

	onUnmounted(() => {
		if (disposeTooltipComponent) disposeTooltipComponent();
	});

	onDeactivated(() => {
		tooltipShowing.value = false;
	});

	const handler: TooltipOptions["external"] = (context) => {
		if (context.tooltip.opacity === 0) {
			tooltipShowing.value = false;
			return;
		}

		tooltipTitle.value = context.tooltip.title[0];
		tooltipSeries.value = context.tooltip.body.map((b, i) => ({
			backgroundColor: context.tooltip.labelColors[i].backgroundColor,
			borderColor: context.tooltip.labelColors[i].borderColor,
			text: b.lines[0],
		}));

		const rect = context.chart.canvas.getBoundingClientRect();

		tooltipShowing.value = true;
		tooltipX.value = rect.left + window.scrollX + context.tooltip.caretX;
		if (opts.position === "top") {
			tooltipY.value = rect.top + window.scrollY;
		} else if (opts.position === "middle") {
			tooltipY.value = rect.top + window.scrollY + context.tooltip.caretY;
		}
	};

	return {
		handler,
	};
}
