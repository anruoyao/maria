<template>
	<div class="vrvdvrys">
		<XPie class="pie" :value="usage" />
		<div>
			<p><i :class="icon('ph-cpu')"></i>CPU</p>
			<p>{{ meta.cpu.cores }} Logical cores</p>
			<p>{{ meta.cpu.model }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import XPie from "./pie.vue";
import icon from "@/scripts/icon";

const props = defineProps<{
	connection: any;
	meta: any;
}>();

const usage = ref(0);

function onStats(stats) {
	usage.value = stats.cpu / 100;
}

onMounted(() => {
	props.connection.on("stats", onStats);
});

onBeforeUnmount(() => {
	props.connection.off("stats", onStats);
});
</script>

<style lang="scss" scoped>
.vrvdvrys {
	display: flex;
	padding: 16px;

	> .pie {
		block-size: 82px;
		flex-shrink: 0;
		margin-inline-end: 16px;
	}

	> div {
		flex: 1;

		> p {
			margin: 0;
			font-size: 0.8em;

			&:first-child {
				font-weight: bold;
				margin-block-end: 4px;

				> i {
					margin-inline-end: 4px;
				}
			}
		}
	}
}
</style>
