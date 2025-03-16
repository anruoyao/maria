<template>
	<div class="zbwaqsat">
		<XPie class="pie" :value="usage" />
		<div>
			<p><i :class="icon('ph-hard-drives')"></i>Disk</p>
			<p>Total: {{ bytes(total, 1) }}</p>
			<p>Available: {{ bytes(available, 1) }}</p>
			<p>Used: {{ bytes(used, 1) }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import XPie from "./pie.vue";
import bytes from "@/filters/bytes";
import icon from "@/scripts/icon";

const props = defineProps<{
	meta: {
		fs: {
			used: number;
			total: number;
		};
	};
}>();

const usage = computed(() => props.meta.fs.used / props.meta.fs.total);
const total = computed(() => props.meta.fs.total);
const used = computed(() => props.meta.fs.used);
const available = computed(() => props.meta.fs.total - props.meta.fs.used);
</script>

<style lang="scss" scoped>
.zbwaqsat {
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
