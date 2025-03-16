<template>
	<div v-if="note" class="reacted-users">
		<div :class="$style.tabs">
			<button
				v-for="reaction in reactions"
				:key="reaction"
				:class="[$style.tab, { [$style.tabActive]: tab === reaction }]"
				class="_button"
				@click="tab = reaction"
			>
				<MkReactionIcon
					ref="reactionRef"
					:reaction="
						reaction
							? reaction.replace(/^:(\w+):$/, ':$1@.:')
							: reaction
					"
					:custom-emojis="note.emojis"
					style="max-inline-size: 100%"
				/>
				<span style="margin-inline-start: 4px">{{
					note.reactions[reaction]
				}}</span>
			</button>
		</div>
		<MkPagination
			ref="pagingComponent"
			v-slot="{ items }"
			:pagination="pagination"
		>
			<MkUserCardMini v-for="{ user: user } in items" :key="user.id" :user="user" />
		</MkPagination>
	</div>
	<div v-else>
		<MkLoading />
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import type { entities } from "firefish-js";
import MkReactionIcon from "@/components/MkReactionIcon.vue";
import MkUserCardMini from "@/components/MkUserCardMini.vue";
import * as os from "@/os";
import MkPagination, {
	type MkPaginationType,
} from "@/components/MkPagination.vue";

const props = defineProps<{
	noteId: entities.Note["id"];
}>();

const note = ref<entities.Note>();
const tab = ref<string | null>(null);
const reactions = ref<string[]>();

const pagingComponent = ref<MkPaginationType<"notes/reactions"> | null>(null);

const pagination = {
	endpoint: "notes/reactions" as const,
	params: {
		noteId: props.noteId,
		type: tab.value,
	},
	offsetMode: true,
	limit: 30,
};

function updateUsers(): void {
	pagination.params.type = tab.value;
	pagingComponent.value?.reload();
}

watch(tab, updateUsers);

onMounted(() => {
	os.api("notes/show", {
		noteId: props.noteId,
	}).then(async (res) => {
		reactions.value = Object.keys(res.reactions);
		note.value = res;
		// updateUsers();
	});
});
</script>

<style lang="scss" module>
.tabs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.tab {
	padding-block: 4px;
	padding-inline: 6px;
	border: solid 1px var(--divider);
	border-radius: 6px;
	max-inline-size: 50%;
}

.tabActive {
	border-color: var(--accent);
}
</style>
