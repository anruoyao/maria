<template>
	<MkA
		class="user-card-mini"
		:class="[
			$style.root,
			{ yellow: user.isSilenced, red: user.isSuspended, gray: false },
		]"
		:to="props.showAboutPage ? `/user-info/${user.id}` : userPage(user)"
	>
		<MkAvatar
			class="avatar"
			:user="user"
			:disable-link="true"
			:show-indicator="true"
		/>
		<div class="body">
			<span class="name"><MkUserName class="name" :user="user" /></span>
			<span class="sub"
				><span class="acct _monospace"
					>@{{ acct.toString(user) }}</span
				></span
			>
		</div>
	</MkA>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { acct, type entities } from "firefish-js";
import { userPage } from "@/filters/user";

const props = withDefaults(
	defineProps<{
		user: entities.User;
		showAboutPage?: boolean;
	}>(),
	{
		showAboutPage: false,
	},
);
</script>

<style lang="scss" module>
.root {
	$bodyTitleHieght: 18px;
	$bodyInfoHieght: 16px;

	display: flex;
	align-items: center;
	padding: 16px;
	background: var(--panel);
	border-radius: 8px;
	transition: background 0.2s;

	> :global(.avatar) {
		display: block;
		inline-size: ($bodyTitleHieght + $bodyInfoHieght);
		block-size: ($bodyTitleHieght + $bodyInfoHieght);
		margin-inline-end: 12px;
	}

	> :global(.body) {
		flex: 1;
		overflow: hidden;
		font-size: 0.9em;
		color: var(--fg);
		padding-inline-end: 8px;

		> :global(.name) {
			display: block;
			inline-size: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			line-height: $bodyTitleHieght;
		}

		> :global(.sub) {
			display: block;
			inline-size: 100%;
			font-size: 95%;
			opacity: 0.7;
			line-height: $bodyInfoHieght;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		// > :global(.moderation) {
		// 	display: flex;
		// 	gap: 1rem;
		// 	margin-inline-end: 1rem;
		// }
	}

	> :global(.chart) {
		block-size: 30px;
	}

	&:hover,
	&:focus {
		background: var(--panelHighlight);
	}

	&:global(.yellow) {
		--c: rgb(255 196 0 / 15%);
		background-image: linear-gradient(
			45deg,
			var(--c) 16.67%,
			transparent 16.67%,
			transparent 50%,
			var(--c) 50%,
			var(--c) 66.67%,
			transparent 66.67%,
			transparent 100%
		);
		background-size: 16px 16px;
	}

	&:global(.red) {
		--c: rgb(255 0 0 / 15%);
		background-image: linear-gradient(
			45deg,
			var(--c) 16.67%,
			transparent 16.67%,
			transparent 50%,
			var(--c) 50%,
			var(--c) 66.67%,
			transparent 66.67%,
			transparent 100%
		);
		background-size: 16px 16px;
	}

	&:global(.gray) {
		--c: var(--bg);
		background-image: linear-gradient(
			45deg,
			var(--c) 16.67%,
			transparent 16.67%,
			transparent 50%,
			var(--c) 50%,
			var(--c) 66.67%,
			transparent 66.67%,
			transparent 100%
		);
		background-size: 16px 16px;
	}
}
</style>
