<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<MkSpacer>
			<div class="tl _block">
				<XTimeline
					ref="tlEl"
					:key="listId"
					class="tl"
					src="list"
					:list="listId"
					:sound="true"
				/>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { entities } from "firefish-js";
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
	listId: string;
}>();

const list = ref<entities.UserList>();
const tlEl = ref<InstanceType<typeof XTimeline>>();

watch(
	() => props.listId,
	async () => {
		list.value = await os.api("users/lists/show", {
			listId: props.listId,
		});
	},
	{ immediate: true },
);

function settings() {
	router.push(`/my/lists/${props.listId}`);
}

async function timetravel() {
	const { canceled, result: date } = await os.inputDate({
		title: i18n.ts.date,
	});
	if (canceled) return;
	// FIXME:
	tlEl.value!.timetravel(date);
}

const headerActions = computed(() =>
	list.value
		? [
				{
					icon: `${icon("ph-calendar-blank")}`,
					text: i18n.ts.jumpToSpecifiedDate,
					handler: timetravel,
				},
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
		list.value
			? {
					title: list.value.name,
					icon: `${icon("ph-list-bullets ph-dir")}`,
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
