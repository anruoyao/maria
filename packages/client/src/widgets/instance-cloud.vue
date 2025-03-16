<template>
	<MkContainer
		:naked="widgetProps.transparent"
		:show-header="false"
		class="mkw-instance-cloud"
	>
		<div class="">
			<MkTagCloud v-if="activeInstances">
				<li v-for="instance in activeInstances" :key="instance.id">
					<a @click.prevent="onInstanceClick(instance)">
						<img
							style="inline-size: 32px"
							:src="getInstanceIcon(instance)"
							@error="getInstanceIconErrorEvent($event)"
						/>
					</a>
				</li>
			</MkTagCloud>
		</div>
	</MkContainer>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from "vue";

import { useWidgetPropsManager } from "./widget";
import type {
	WidgetComponentExpose,
	WidgetComponentProps,
	WidgetComponentEmits,
} from "./widget";
import type { GetFormResultType } from "@/scripts/form";
import MkContainer from "@/components/MkContainer.vue";
import MkTagCloud from "@/components/MkTagCloud.vue";
import * as os from "@/os";
import { useInterval } from "@/scripts/use-interval";
import { getProxiedImageUrlNullable } from "@/scripts/media-proxy";

const name = "instanceCloud";

const widgetPropsDef = {
	transparent: {
		type: "boolean" as const,
		default: false,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(
	name,
	widgetPropsDef,
	props,
	emit,
);

const cloud = ref<InstanceType<typeof MkTagCloud> | null>();
const activeInstances = shallowRef(null);

function onInstanceClick(i) {
	os.pageWindow(`/instance-info/${i.host}`);
}

useInterval(
	() => {
		os.api("federation/instances", {
			sort: "+lastCommunicatedAt",
			limit: 25,
		}).then((res) => {
			activeInstances.value = res;
			if (cloud.value) cloud.value.update();
		});
	},
	1000 * 60 * 3,
	{
		immediate: true,
		afterMounted: true,
	},
);

function getInstanceIcon(instance): string {
	return (
		getProxiedImageUrlNullable(instance.faviconUrl, "preview") ??
		getProxiedImageUrlNullable(instance.iconUrl, "preview") ??
		"/client-assets/dummy.png"
	);
}

function getInstanceIconErrorEvent($event) {
	$event.target.src = "/client-assets/dummy.png";
}

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>

<style lang="scss" scoped></style>
