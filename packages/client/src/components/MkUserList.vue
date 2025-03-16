<template>
	<MkPagination ref="pagingComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img
					src="/static-assets/badges/info.webp"
					class="_ghost"
					alt="Info"
				/>
				<div>{{ i18n.ts.noUsers }}</div>
			</div>
		</template>

		<template #default="{ items }: { items: entities.UserDetailed[] }">
			<div class="efvhhmdq">
				<MkUserInfo
					v-for="user in items"
					:key="user.id"
					class="user"
					:user="user"
				/>
			</div>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { entities } from "firefish-js";
import MkUserInfo from "@/components/MkUserInfo.vue";
import type {
	MkPaginationType,
	PagingKeyOf,
	PagingOf,
} from "@/components/MkPagination.vue";
import MkPagination from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";

defineProps<{
	pagination: PagingOf<entities.UserDetailed>;
	noGap?: boolean;
}>();

const pagingComponent = ref<MkPaginationType<PagingKeyOf<entities.User>>>();
</script>

<style lang="scss" scoped>
.efvhhmdq {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	grid-gap: var(--margin);
}
</style>
