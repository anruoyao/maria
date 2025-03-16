<template>
	<button
		ref="el"
		class="_button"
		:class="{ fade: modelValue, showLess: !modelValue }"
		@click.stop="toggle"
	>
		<span>{{ modelValue ? i18n.ts.showMore : i18n.ts.showLess }}</span>
	</button>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { i18n } from "@/i18n";

const props = defineProps<{
	modelValue: boolean;
}>();

const el = ref<HTMLElement>();

const emit = defineEmits<{
	(ev: "update:modelValue", v: boolean): void;
}>();

const toggle = () => {
	emit("update:modelValue", !props.modelValue);
};

function focus() {
	el.value.focus();
}

defineExpose({
	focus,
});
</script>
<style lang="scss" scoped>
.fade {
	display: block;
	position: absolute;
	inset-block-end: 0;
	inset-inline-start: 0;
	inline-size: 100%;
	padding: 20px;
	margin-block-end: -10px;
	z-index: 5;
	> span {
		display: inline-block;
		background: var(--panel);
		padding-block: 0.4em;
		padding-inline: 1em;
		font-size: 0.8em;
		border-radius: 999px;
		box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
	}
	&:hover {
		> span {
			background: var(--panelHighlight);
		}
	}
}
.showLess {
	inline-size: 100%;
	position: sticky;
	inset-block-end: calc(var(--stickyBottom) - 1em);
	padding: 20px;
	z-index: 5;

	> span {
		display: inline-block;
		background: var(--panel);
		padding-block: 6px;
		padding-inline: 10px;
		font-size: 0.8em;
		border-radius: 999px;
		box-shadow: 0 0 7px 7px var(--bg);
	}
}
</style>
