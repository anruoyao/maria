<template>
	<div>
		<MkLoading v-if="fetching" />
		<div v-show="!fetching" :class="$style.root">
			<div
				v-if="topSubInstancesForPie && topPubInstancesForPie"
				class="pies"
			>
				<div class="pie deliver _panel">
					<div class="title">Sub</div>
					<XPie :data="topSubInstancesForPie" class="chart" />
					<div class="subTitle">Top 10</div>
				</div>
				<div class="pie inbox _panel">
					<div class="title">Pub</div>
					<XPie :data="topPubInstancesForPie" class="chart" />
					<div class="subTitle">Top 10</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import XPie from "./overview.pie.vue";
import * as os from "@/os";
import { useChartTooltip } from "@/scripts/use-chart-tooltip";

const topSubInstancesForPie = ref<any>(null);
const topPubInstancesForPie = ref<any>(null);
const fetching = ref(true);

useChartTooltip();

onMounted(async () => {
	os.apiGet("federation/stats", { limit: 10 }).then((res) => {
		topSubInstancesForPie.value = res.topSubInstances
			.map((x) => ({
				name: x.host,
				color: x.themeColor,
				value: x.followersCount,
				onClick: () => {
					os.pageWindow(`/instance-info/${x.host}`);
				},
			}))
			.concat([
				{
					name: "(other)",
					color: "#80808080",
					value: res.otherFollowersCount,
				},
			]);
		topPubInstancesForPie.value = res.topPubInstances
			.map((x) => ({
				name: x.host,
				color: x.themeColor,
				value: x.followingCount,
				onClick: () => {
					os.pageWindow(`/instance-info/${x.host}`);
				},
			}))
			.concat([
				{
					name: "(other)",
					color: "#80808080",
					value: res.otherFollowingCount,
				},
			]);
	});

	fetching.value = false;
});
</script>

<style lang="scss" module>
.root {
	&:global {
		> .pies {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
			grid-gap: 12px;
			margin-block-end: 12px;

			> .pie {
				position: relative;
				padding: 12px;

				> .title {
					position: absolute;
					inset-block-start: 20px;
					inset-inline-start: 20px;
					font-size: 90%;
				}

				> .chart {
					max-block-size: 150px;
				}

				> .subTitle {
					position: absolute;
					inset-block-end: 20px;
					inset-inline-end: 20px;
					font-size: 85%;
				}
			}
		}

		> .items {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
			grid-gap: 12px;

			> .item {
				display: flex;
				box-sizing: border-box;
				padding: 12px;

				> .icon {
					display: grid;
					place-items: center;
					block-size: 100%;
					aspect-ratio: 1;
					margin-inline-end: 12px;
					background: var(--accentedBg);
					color: var(--accent);
					border-radius: 10px;
				}

				&.sub {
					> .icon {
						background: #907aa922;
						color: #c4a7e7;
					}
				}

				&.pub {
					> .icon {
						background: #56949f22;
						color: #9ccfd8;
					}
				}

				> .body {
					padding-block: 2px;
					padding-inline: 0;

					> .value {
						font-size: 1.2em;
						font-weight: bold;

						> .diff {
							font-size: 0.65em;
							font-weight: normal;
						}
					}

					> .label {
						font-size: 0.8em;
						opacity: 0.5;
					}
				}
			}
		}
	}
}
</style>
