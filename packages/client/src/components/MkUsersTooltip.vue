<template>
	<MkTooltip
		ref="tooltip"
		:target-element="targetElement"
		:max-width="250"
		:showing="showing"
		@closed="emit('closed')"
	>
		<div class="beaffaef">
			<div v-for="u in users" :key="u.id" class="user">
				<MkAvatar class="avatar" :user="u" disable-link />
				<MkUserName class="name" :user="u" :nowrap="true" />
			</div>
			<div v-if="users.length < count" class="omitted">
				+{{ count - users.length }}
			</div>
		</div>
	</MkTooltip>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";
import MkTooltip from "./MkTooltip.vue";

defineProps<{
	showing: boolean;
	users: entities.User[];
	count: number;
	targetElement?: HTMLElement;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();
</script>

<style lang="scss" scoped>
.beaffaef {
	font-size: 0.9em;
	text-align: start;

	> .user {
		line-height: 24px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		&:not(:last-child) {
			margin-block-end: 3px;
		}

		> .avatar {
			inline-size: 24px;
			block-size: 24px;
			margin-inline-end: 3px;
		}
	}
}
</style>
