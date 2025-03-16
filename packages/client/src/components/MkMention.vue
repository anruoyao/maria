<template>
	<MkA
		v-if="url.startsWith('/')"
		v-user-preview="canonical"
		class="mention"
		:class="{ isMe }"
		:to="url"
		@click.stop
	>
		<img class="icon" :src="`/avatar/@${username}@${host}`" alt="" />
		<span class="main">
			<span class="username">@{{ username }}</span>
			<span
				v-if="host != localHost || defaultStore.state.showFullAcct"
				class="host"
				>@{{ toUnicode(host) }}</span
			>
		</span>
	</MkA>
	<a
		v-else
		class="mention"
		:href="url"
		target="_blank"
		rel="noopener"
		@click.stop
	>
		<span class="main">
			<span class="username">@{{ username }}</span>
			<span class="host">@{{ toUnicode(host) }}</span>
		</span>
	</a>
</template>

<script lang="ts" setup>
import { toUnicode } from "punycode";
import { host as localHost } from "@/config";
import { isSignedIn, me } from "@/me";
import { defaultStore } from "@/store";

const props = defineProps<{
	username: string;
	host: string;
}>();

const canonical =
	props.host === localHost
		? `@${props.username}`
		: `@${props.username}@${toUnicode(props.host)}`;

const url = `/${canonical}`;

const isMe =
	isSignedIn(me) &&
	`@${props.username}@${toUnicode(props.host)}`.toLowerCase() ===
		`@${me.username}@${toUnicode(localHost)}`.toLowerCase();
</script>

<style lang="scss" scoped>
.mention {
	position: relative;
	display: inline-block;
	padding-block-start: 2px;
	padding-inline-end: 8px;
	padding-block-end: 2px;
	padding-inline-start: 2px;
	margin-block: 2px;
	border-radius: 999px;
	max-inline-size: 100%;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--mention);
	isolation: isolate;

	&::before {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: var(--mention);
		opacity: 0.1;
		z-index: -1;
	}

	&.isMe {
		--mention: var(--mentionMe);
	}

	> .icon {
		inline-size: 1.5em;
		block-size: 1.5em;
		object-fit: cover;
		margin-block-start: 0;
		margin-inline-end: 0.2em;
		margin-block-end: 0;
		margin-inline-start: 0;
		vertical-align: bottom;
		border-radius: 100%;
	}

	> .main > .host {
		opacity: 0.5;
	}
}
</style>
