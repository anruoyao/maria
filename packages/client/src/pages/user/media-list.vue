<template>
	<MkSpacer :content-max="1100">
		<div :class="$style.root">
			<MkPagination v-slot="{items}" :pagination="pagination">
				<div :class="$style.stream">
					<MkNoteMediaList v-for="note in items" :note="note"/>
				</div>
			</MkPagination>
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { entities } from "firefish-js";
import MkNoteMediaList from "@/components/note/MkNoteMediaList.vue";
import MkPagination from "@/components/MkPagination.vue";

const props = defineProps<{
	user: entities.UserDetailed;
}>();

const pagination = {
	endpoint: "users/notes" as const,
	limit: 10,
	params: computed(() => ({
		userId: props.user.id,
		withFiles: true,
	})),
};
</script>

<style lang="scss" module>
.root {
	padding: 8px;
}

.stream {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 160px;
	grid-gap: 6px;
}

@media (max-inline-size: 720px) {
	.stream {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	}
}
</style>
