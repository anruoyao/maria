<template>
	<MkTooltip
		ref="tooltip"
		:target-element="targetElement"
		:max-width="340"
		:showing="showing"
		@closed="emit('closed')"
	>
		<div class="bqxuuuey">
			<div class="reaction">
				<XReactionIcon
					:reaction="reaction"
					:custom-emojis="emojis"
					class="icon"
					:no-style="true"
				/>
				<div class="name">{{ reaction.replace("@.", "") }}</div>
			</div>
			<div class="users">
				<div v-for="u in users" :key="u.id" class="user">
					<MkAvatar class="avatar" :user="u" />
					<MkUserName class="name" :user="u" :nowrap="true" />
				</div>
				<div v-if="users.length > 10" class="omitted">
					+{{ count - 10 }}
				</div>
			</div>
		</div>
	</MkTooltip>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";
import MkTooltip from "./MkTooltip.vue";
import XReactionIcon from "@/components/MkReactionIcon.vue";

defineProps<{
	showing: boolean;
	reaction: string;
	users: entities.User[]; // TODO
	count: number;
	emojis: entities.EmojiLite[]; // TODO
	targetElement?: HTMLElement;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();
</script>

<style lang="scss" scoped>
.bqxuuuey {
	display: flex;

	> .reaction {
		max-inline-size: 100px;
		text-align: center;

		> .icon {
			display: block;
			inline-size: 60px;
			font-size: 60px; // unicodeな絵文字についてはwidthが効かないため
			margin-block: 0;
			margin-inline: auto;
		}

		> .name {
			font-size: 1em;
		}
	}

	> .users {
		flex: 1;
		min-inline-size: 0;
		font-size: 0.95em;
		border-inline-start: solid 0.5px var(--divider);
		padding-inline-start: 10px;
		margin-inline-start: 10px;
		margin-inline-end: 14px;
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
}
</style>
