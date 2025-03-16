<template>
	<div class="zlxnikvl">
		<XPie class="pie" :value="usage" />
		<div>
			<p><i :class="icon('ph-microchip')"></i>RAM</p>
			<p>Total: {{ bytes(total, 1) }}</p>
			<p>Used: {{ bytes(used, 1) }}</p>
			<p>Available: {{ bytes(available, 1) }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import XPie from "./pie.vue";
import bytes from "@/filters/bytes";
import icon from "@/scripts/icon";

const props = defineProps<{
	connection: any;
}>();

const usage = ref<number>(0);
const total = ref<number>(0);
const used = ref<number>(0);
const available = ref<number>(0);

function onStats(stats) {
	usage.value = stats.mem.used / stats.mem.total;
	total.value = stats.mem.total;
	used.value = stats.mem.used;
	available.value = stats.mem.available;
}

onMounted(() => {
	props.connection.on("stats", onStats);
});

onBeforeUnmount(() => {
	props.connection.off("stats", onStats);
});
</script>

<style lang="scss" scoped>
.zlxnikvl {
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
