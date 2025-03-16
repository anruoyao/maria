<template>
	<section class="sdgxphyu">
		<component :is="'h' + h">{{ block.title }}</component>

		<div class="children">
			<XBlock
				v-for="child in block.children"
				:key="child.id"
				:block="child"
				:hpml="hpml"
				:h="h + 1"
			/>
		</div>
	</section>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { defineAsyncComponent, defineComponent } from "vue";
import type { SectionBlock } from "@/scripts/hpml/block";
import type { Hpml } from "@/scripts/hpml/evaluator";

export default defineComponent({
	components: {
		XBlock: defineAsyncComponent(() => import("./page.block.vue")),
	},
	props: {
		block: {
			type: Object as PropType<SectionBlock>,
			required: true,
		},
		hpml: {
			type: Object as PropType<Hpml>,
			required: true,
		},
		h: {
			required: true,
		},
	},
});
</script>

<style lang="scss" scoped>
.sdgxphyu {
	margin-block: 1.5em;
	margin-inline: 0;

	> h2 {
		font-size: 1.35em;
		margin-block-start: 0;
		margin-inline-end: 0;
		margin-block-end: 0.5em;
		margin-inline-start: 0;
	}

	> h3 {
		font-size: 1em;
		margin-block-start: 0;
		margin-inline-end: 0;
		margin-block-end: 0.5em;
		margin-inline-start: 0;
	}

	> h4 {
		font-size: 1em;
		margin-block-start: 0;
		margin-inline-end: 0;
		margin-block-end: 0.5em;
		margin-inline-start: 0;
	}

	// > .children {
	// 	padding: 16px;
	// }
}
</style>
