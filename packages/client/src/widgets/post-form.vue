<template>
	<XPostForm
		class="_panel mkw-postForm"
		:fixed="true"
		:autofocus="false"
		:show-mfm-cheat-sheet="true"
	/>
</template>

<script lang="ts" setup>
import type {
	WidgetComponentExpose,
	WidgetComponentProps,
	WidgetComponentEmits,
} from "./widget";
import { useWidgetPropsManager } from "./widget";
import type { GetFormResultType } from "@/scripts/form";
import XPostForm from "@/components/MkPostForm.vue";

const name = "postForm";

const widgetPropsDef = {};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(
	name,
	widgetPropsDef,
	props,
	emit,
);

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>
