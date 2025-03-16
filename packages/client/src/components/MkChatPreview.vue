<template>
	<MkA
		class="rivslvers"
		:class="{
			isMe: isMe(message),
			isRead: message.groupId
				? message.reads.includes(me!.id)
				: message.isRead,
		}"
		:to="
			message.groupId
				? `/my/messaging/group/${message.groupId}`
				: `/my/messaging/${acct.toString(
						isMe(message) ? message.recipient! : message.user,
					)}`
		"
	>
		<div class="message _block">
			<MkAvatar
				class="avatar"
				:user="
					message.groupId
						? message.user
						: isMe(message)
							? message.recipient!
							: message.user
				"
				:show-indicator="true"
				disable-link
			/>
			<header v-if="message.groupId">
				<span class="name">{{ message.group!.name }}</span>
				<MkTime :time="message.createdAt" class="time" />
			</header>
			<header v-else>
				<span class="name"
					><MkUserName
						:user="
							isMe(message) ? message.recipient! : message.user
						"
				/></span>
				<span class="username"
					>@{{
						acct.toString(
							isMe(message) ? message.recipient! : message.user,
						)
					}}</span
				>
				<MkTime :time="message.createdAt" class="time" />
			</header>
			<div class="body">
				<p class="text">
					<span v-if="isMe(message)" class="me"
						>{{ i18n.ts.you }}:
					</span>
					<Mfm
						v-if="message.text != null && message.text.length > 0"
						:text="message.text"
					/>
					<span v-else> 📎</span>
				</p>
			</div>
		</div>
	</MkA>
</template>

<script lang="ts" setup>
import { acct, type entities } from "firefish-js";
import { i18n } from "@/i18n";
import { me } from "@/me";

defineProps<{
	message: entities.MessagingMessage;
}>();

function isMe(message: entities.MessagingMessage): boolean {
	return message.userId === me?.id;
}
</script>

<style lang="scss" scoped>
.rivslvers {
	> .message {
		display: block;
		text-decoration: none;
		margin-block-end: var(--margin);
		padding-block: 20px;
		padding-inline: 30px;

		* {
			pointer-events: none;
			user-select: none;
		}

		&:hover {
			.avatar {
				filter: saturate(200%);
			}
		}

		&.isRead,
		&.isMe {
			opacity: 0.8;
		}

		&:not(.isMe):not(.isRead) {
			background-color: var(--accentedBg);
		}

		&:after {
			content: "";
			display: block;
			clear: both;
		}

		> header {
			display: flex;
			align-items: center;
			margin-block-end: 2px;
			white-space: nowrap;
			overflow: hidden;

			> .name {
				margin: 0;
				padding: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				font-size: 1em;
				font-weight: bold;
				transition: all 0.1s ease;
			}

			> .username {
				margin-block: 0;
				margin-inline: 8px;
			}

			> .time {
				margin-block-start: 0;
				margin-inline-end: 0;
				margin-block-end: 0;
				margin-inline-start: auto;
			}
		}

		> .avatar {
			float: inline-start;
			inline-size: 54px;
			block-size: 54px;
			margin-block-start: 0;
			margin-inline-end: 16px;
			margin-block-end: 0;
			margin-inline-start: 0;
			border-radius: 8px;
			transition: all 0.1s ease;
		}

		> .body {
			> .text {
				display: block;
				margin-block-start: 0;
				margin-inline-end: 0;
				margin-block-end: 0;
				margin-inline-start: 0;
				padding: 0;
				overflow: hidden;
				overflow-wrap: break-word;
				text-decoration: none;
				font-size: 1.1em;
				color: var(--faceText);

				.me {
					opacity: 0.7;
				}
			}

			> .image {
				display: block;
				max-inline-size: 100%;
				max-block-size: 512px;
			}
		}
	}

	&.max-width_400px {
		> .message {
			> div {
				padding: 16px;
				font-size: 0.9em;

				> .avatar {
					margin-block-start: 0;
					margin-inline-end: 12px;
					margin-block-end: 0;
					margin-inline-start: 0;
				}
			}
		}
	}
}
</style>
