<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<MkSpacer v-hotkey.global="keymap" :content-max="800">
			<div class="tl _block">
				<XTimeline
					ref="tlEl"
					:key="antennaId"
					class="tl"
					src="antenna"
					:antenna="antennaId"
					:sound="true"
				/>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
// TODO: disable this rule properly
// biome-ignore lint/style/useImportType: used in <template>
import XTimeline from "@/components/MkTimeline.vue";
import * as os from "@/os";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const router = useRouter();

const props = defineProps<{
	antennaId: string;
}>();

const antenna = ref(null);
const tlEl = ref<InstanceType<typeof XTimeline>>();
const keymap = computed(() => ({
	t: focus,
}));

function settings() {
	router.push(`/my/antennas/${props.antennaId}`);
}

// async function doMarkRead() {
// 	const ret = await os.api("antennas/mark-read", {
// 		antennaId: props.antennaId,
// 	});
//
// 	if (ret) {
// 		return true;
// 	}
//
//	throw new Error("Failed to mark all as read");
// }

function focus() {
	tlEl.value.focus();
}

watch(
	() => props.antennaId,
	async () => {
		antenna.value = await os.api("antennas/show", {
			antennaId: props.antennaId,
		});
	},
	{ immediate: true },
);

const headerActions = computed(() =>
	antenna.value
		? [
				{
					icon: `${icon("ph-gear-six")}`,
					text: i18n.ts.settings,
					handler: settings,
				},
			]
		: [],
);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		antenna.value
			? {
					title: antenna.value.name,
					icon: `${icon("ph-flying-saucer")}`,
				}
			: null,
	),
);
</script>

<style lang="scss" scoped>
.tl {
	background: none;
	border-radius: var(--radius);
}
</style>
