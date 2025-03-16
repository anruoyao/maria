<template>
	<MkSpacer :content-max="800">
		<MkPagination v-slot="{ items }" ref="list" :pagination="pagination">
			<div
				v-for="item in items"
				:key="item.id"
				:to="`/clips/${item.id}`"
				class="item _panel _gap afdcfbfb"
			>
				<div class="header">
					<MkAvatar class="avatar" :user="user" />
					<MkReactionIcon
						class="reaction"
						:reaction="item.type"
						:custom-emojis="item.note.emojis"
						:no-style="true"
					/>
					<MkTime :time="item.createdAt" class="createdAt" />
				</div>
				<MkNote :key="item.id" :note="item.note" />
			</div>
		</MkPagination>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { entities } from "firefish-js";
import MkPagination from "@/components/MkPagination.vue";
import MkNote from "@/components/MkNote.vue";
import MkReactionIcon from "@/components/MkReactionIcon.vue";

const props = defineProps<{
	user: entities.User;
}>();

const pagination = {
	endpoint: "users/reactions" as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" scoped>
.afdcfbfb {
	> .header {
		display: flex;
		align-items: center;
		padding-block: 8px;
		padding-inline: 16px;
		margin-block-end: 8px;
		border-block-end: solid 2px var(--divider);

		> .avatar {
			inline-size: 24px;
			block-size: 24px;
			margin-inline-end: 8px;
		}

		> .reaction {
			inline-size: 32px;
			block-size: 32px;
		}

		> .createdAt {
			margin-inline-start: auto;
		}
	}
}
</style>
