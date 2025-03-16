<template>
	<div
		ref="elRef"
		v-size="{ max: [500, 450] }"
		class="qglefbjs notification"
		:class="notification.type"
	>
		<div class="meta">
			<span class="info">
				<span class="sub-icon" :class="notification.type">
					<i
						v-if="notification.type === 'renote'"
						:class="icon('ph-rocket-launch', false)"
					></i>
					<i
						v-if="notification.type === 'pollVote'"
						:class="icon('ph-microphone-stage', false)"
					></i>
					<XReactionIcon
						v-else-if="
							showEmojiReactions && notification.type === 'reaction'
						"
						ref="reactionRef"
						:reaction="
							notification.reaction
								? notification.reaction.replace(
										/^:(\w+):$/,
										':$1@.:',
									)
								: notification.reaction
						"
						:custom-emojis="notification.note.emojis"
					/>
					<XReactionIcon
						v-else-if="
							!showEmojiReactions && notification.type === 'reaction'
						"
						:reaction="defaultReaction"
						:no-style="true"
					/>
				</span>
				<span class="avatars">
					<MkAvatar
						v-for="user in users"
						:key="user.id"
						class="avatar"
						:user="user"
					/>
				</span>
				<span class="text">
					{{ getText() }}
				</span>
				
			</span>
			<MkTime
				v-if="withTime"
				:time="notification.createdAt"
				class="time"
			/>
		</div>
		<!-- Since the reacted user list is actually shown above, the emoji-viewer is hidden to prevent visual noise -->
		<XNote
			v-if="notification.type === 'renote'"
			class="content"
			:note="removeReplyTo(notification.note.renote)"
			:hide-emoji-viewer="true"
			:is-long-judger="isLongJudger"
		/>
		<XNote
			v-else
			class="content"
			:note="removeReplyTo(notification.note)"
			:hide-emoji-viewer="true"
			:is-long-judger="isLongJudger"
		/>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { Connection } from "firefish-js/src/streaming";
import type { Channels } from "firefish-js/src/streaming.types";
import type { entities } from "firefish-js";
import XReactionIcon from "@/components/MkReactionIcon.vue";
import XReactionTooltip from "@/components/MkReactionTooltip.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { useStream } from "@/stream";
import { useTooltip } from "@/scripts/use-tooltip";
import { defaultStore } from "@/store";
import { getInstanceInfo } from "@/instance";
import icon from "@/scripts/icon";
import type {
	NotificationFolded,
	ReactionNotificationFolded,
} from "@/types/notification";
import XNote from "@/components/MkNote.vue";

const props = withDefaults(
	defineProps<{
		notification: NotificationFolded;
		withTime?: boolean;
		full?: boolean;
	}>(),
	{
		withTime: false,
		full: false,
	},
);

const stream = useStream();

const elRef = ref<HTMLElement | null>(null);
const reactionRef = ref<InstanceType<typeof XReactionIcon> | null>(null);

const showEmojiReactions =
	defaultStore.state.enableEmojiReactions ||
	defaultStore.state.showEmojisInReactionNotifications;
const realDefaultReaction = getInstanceInfo().defaultReaction;
const defaultReaction = ["⭐", "👍", "❤️"].includes(realDefaultReaction)
	? realDefaultReaction
	: "⭐";

const users = computed(() => props.notification.users.slice(0, 5));
const userleft = computed(
	() => props.notification.users.length - users.value.length,
);

let readObserver: IntersectionObserver | undefined;
let connection: Connection<Channels["main"]> | null = null;

function isLongJudger(note: entities.Note) {
	return (
		note.text != null &&
		(note.text.split("\n").length > 5 ||
			note.text.length > 300 ||
			note.files.length > 4)
	);
}

function getText() {
	let res = "";
	switch (props.notification.type) {
		case "renote":
			res = i18n.ts._notification.renoted;
			break;
		case "reaction":
			res = i18n.ts._notification.reacted;
			break;
		case "pollVote":
			res = i18n.ts._notification.voted;
	}
	if (userleft.value > 0) {
		res = i18n.t("_notification.andCountUsers", {
			count: userleft.value,
			acted: res,
		});
	}
	return res;
}

/**
 * Delete reply-related properties that are not needed for notifications
 */
function removeReplyTo(note: entities.Note): entities.Note {
	return Object.assign(note, {
		replyId: null,
		reply: undefined,
	});
}

useTooltip(reactionRef, (showing) => {
	const n = props.notification as ReactionNotificationFolded;
	os.popup(
		XReactionTooltip,
		{
			showing,
			reaction: n.reaction
				? n.reaction.replace(/^:(\w+):$/, ":$1@.:")
				: n.reaction,
			emojis: n.note.emojis,
			targetElement: reactionRef.value?.$el,
		},
		{},
		"closed",
	);
});

onMounted(() => {
	const unreadNotifications = props.notification.notifications.filter(
		(n) => !n.isRead,
	);

	readObserver = new IntersectionObserver((entries, observer) => {
		if (!entries.some((entry) => entry.isIntersecting)) return;
		for (const u of unreadNotifications) {
			stream.send("readNotification", {
				id: u.id,
			});
		}
		observer.disconnect();
	});

	readObserver.observe(elRef.value!);

	connection = stream.useChannel("main");
	connection.on("readAllNotifications", () => readObserver?.disconnect());
});

onUnmounted(() => {
	if (readObserver) readObserver.disconnect();
	if (connection) connection.dispose();
});
</script>

<style lang="scss" scoped>
.qglefbjs {
	position: relative;
	box-sizing: border-box;
	font-size: 0.9em;
	overflow-wrap: break-word;
	contain: content;

	&.max-width_500px > .meta{
		padding-block: 16px;
		font-size: 0.9em;
	}
	&.max-width_450px > .meta {
		padding-block-start: 12px;
		padding-inline-end: 16px;
		padding-block-end: 0;
		padding-inline-start: 16px;
	}

	> .meta {
		margin-block-start: 1px; // Otherwise it will cover the line
		padding-block-start: 24px;
		padding-inline-end: 32px;
		padding-block-end: 0;
		padding-inline-start: 32px;
		display: flex;
		align-items: baseline;
		white-space: nowrap;
		> .info {
			text-overflow: ellipsis;
				white-space: nowrap;
				min-inline-size: 0;
				overflow: hidden;
			// flex-grow: 1;
			// display: inline-flex;
			> .sub-icon {
				margin-inline-end: 3px;
				font-size: 14px;
			}
			> .avatars > .avatar {
				inline-size: 20px;
				block-size: 20px;
				margin-inline-end: 5px;
			}
		}
		> .time {
			margin-inline-start: auto;
			// flex-grow: 0;
			// flex-shrink: 0;
			white-space: nowrap;
			font-size: 0.9em;
		}
	}
}
</style>
