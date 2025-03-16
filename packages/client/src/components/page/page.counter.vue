<template>
	<div>
		<MkButton class="llumlmnx" @click="click()">{{
			hpml.interpolate(block.text)
		}}</MkButton>
	</div>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { computed, defineComponent } from "vue";
import MkButton from "../MkButton.vue";
import type { CounterVarBlock } from "@/scripts/hpml/block";
import type { Hpml } from "@/scripts/hpml/evaluator";

export default defineComponent({
	components: {
		MkButton,
	},
	props: {
		block: {
			type: Object as PropType<CounterVarBlock>,
			required: true,
		},
		hpml: {
			type: Object as PropType<Hpml>,
			required: true,
		},
	},
	setup(props, ctx) {
		const value = computed(() => {
			return props.hpml.vars.value[props.block.name];
		});

		function click() {
			props.hpml.updatePageVar(
				props.block.name,
				value.value + (props.block.inc || 1),
			);
			props.hpml.eval();
		}

		return {
			click,
		};
	},
});
</script>

<style lang="scss" scoped>
.llumlmnx {
	display: inline-block;
	min-inline-size: 300px;
	max-inline-size: 450px;
	margin-block: 8px;
	margin-inline: 0;
}
</style>
