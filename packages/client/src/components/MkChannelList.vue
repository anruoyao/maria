<template>
	<MkPagination :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img
					src="/static-assets/badges/not-found.webp"
					class="_ghost"
					:alt="i18n.ts.notFound"
				/>
				<div>{{ i18n.ts.notFound }}</div>
			</div>
		</template>

		<template #default="{ items }: { items: entities.Channel[] }">
			<MkChannelPreview
				v-for="item in items"
				:key="item.id"
				class="_margin"
				:channel="extractor(item)"
			/>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";
import MkChannelPreview from "@/components/MkChannelPreview.vue";
import type { PagingOf } from "@/components/MkPagination.vue";
import MkPagination from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";

withDefaults(
	defineProps<{
		pagination: PagingOf<entities.Channel>;
		noGap?: boolean;
		// TODO: this function is not used and may can be removed
		extractor?: (item: entities.Channel) => entities.Channel;
	}>(),
	{
		extractor: (item: entities.Channel) => item,
	},
);
</script>

<style lang="scss" scoped></style>
