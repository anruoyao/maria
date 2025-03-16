<template>
	<div class="_panel" :class="$style.root">
		<div class="ntjkdlsfk">
			<div class="_panel">
				<XPie class="pie" :value="cpuUsage" />
				<div>
					<p><i :class="icon('ph-cpu')"></i>CPU</p>
					<p>{{ meta.cpu.cores }} Logical cores</p>
					<p>{{ meta.cpu.model }}</p>
				</div>
			</div>

			<div class="_panel">
				<XPie class="pie" :value="memUsage" />
				<div>
					<p><i :class="icon('ph-microchip')"></i>RAM</p>
					<p>Total: {{ bytes(memTotal, 1) }}</p>
					<p>Used: {{ bytes(memUsed, 1) }}</p>
					<p>Free: {{ bytes(memFree, 1) }}</p>
				</div>
			</div>

			<div class="_panel">
				<XPie class="pie" :value="diskUsage" />
				<div>
					<p><i :class="icon('ph-hard-drives')"></i>Disk</p>
					<p>Total: {{ bytes(diskTotal, 1) }}</p>
					<p>Free: {{ bytes(diskAvailable, 1) }}</p>
					<p>Used: {{ bytes(diskUsed, 1) }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import XPie from "../../widgets/server-metric/pie.vue";
import bytes from "@/filters/bytes";
import { useStream } from "@/stream";
import * as os from "@/os";
import icon from "@/scripts/icon";

const stream = useStream();

const meta = await os.api("server-info", {});

const cpuUsage = ref(0);

const memUsage = ref(0);
const memTotal = ref(0);
const memUsed = ref(0);
const memFree = ref(0);

const diskUsage = computed(() => meta.fs.used / meta.fs.total);
const diskTotal = computed(() => meta.fs.total);
const diskUsed = computed(() => meta.fs.used);
const diskAvailable = computed(() => meta.fs.total - meta.fs.used);

function onStats(stats) {
	cpuUsage.value = stats.cpu;

	memUsage.value = stats.mem.active / stats.mem.total;
	memTotal.value = stats.mem.total;
	memUsed.value = stats.mem.active;
	memFree.value = memTotal.value - memUsed.value;
}

const connection = stream.useChannel("serverStats");
onMounted(() => {
	connection.on("stats", onStats);
	connection.dispose();
});

onUnmounted(() => {
	connection.off("stats", onStats);
	connection.dispose();
});
</script>

<style lang="scss" module>
.root {
	padding: 20px;
}

.ntjkdlsfk {
	display: flex;
	padding: 16px;

	> ._panel {
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
}
</style>
