<template>
	<MkSpacer :content-max="800">
		<div class="pages-user-clips">
			<MkPagination
				v-slot="{ items }"
				ref="list"
				:pagination="pagination"
				class="list"
			>
				<MkA
					v-for="item in items"
					:key="item.id"
					:to="`/clips/${item.id}`"
					class="item _panel _gap"
				>
					<b>{{ item.name }}</b>
					<div v-if="item.description" class="description">
						{{ item.description }}
					</div>
				</MkA>
			</MkPagination>
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { entities } from "firefish-js";
import MkPagination from "@/components/MkPagination.vue";

const props = defineProps<{
	user: entities.User;
}>();

const pagination = {
	endpoint: "users/clips" as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" scoped>
.pages-user-clips {
	> .list {
		> .item {
			display: block;
			padding: 16px;

			> .description {
				margin-block-start: 8px;
				padding-block-start: 8px;
				border-block-start: solid 0.5px var(--divider);
			}
		}
	}
}
</style>
