<template>
	<div class="defgtij">
		<div v-for="user in users" :key="user.id" class="avatar-holder">
			<MkAvatar :user="user" :show-indicator="true" class="avatar" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { entities } from "firefish-js";
import * as os from "@/os";

const props = defineProps<{
	userIds: string[];
}>();

const users = ref<entities.UserDetailed[]>([]);

onMounted(async () => {
	users.value = await os.api("users/show", {
		userIds: props.userIds,
	});
});
</script>

<style lang="scss">
.defgtij {
	padding: 12px;
	grid-gap: 12px;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(30px, 40px));
	place-content: center;

	> .avatar-holder {
		aspect-ratio: 1;

		> .avatar {
			inline-size: 100%;
			block-size: 100%;
			aspect-ratio: 1;
		}
	}
}
</style>
