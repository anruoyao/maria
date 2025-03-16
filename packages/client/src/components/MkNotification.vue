<template>
	<div
		ref="elRef"
		v-size="{ max: [500, 450] }"
		class="qglefbjs notification"
		:class="notification.type"
	>
		<div class="head">
			<MkAvatar
				v-if="notification.type === 'pollEnded'"
				class="icon"
				:user="notification.note.user"
			/>
			<MkAvatar
				v-else-if="'user' in notification"
				class="icon"
				:user="notification.user"
			/>
			<img
				v-else-if="'icon' in notification && notification.icon"
				class="icon"
				:src="notification.icon"
				alt=""
			/>
			<div class="sub-icon" :class="notification.type">
				<i
					v-if="notification.type === 'follow'"
					:class="icon('ph-hand-waving', false)"
				></i>
				<i
					v-else-if="notification.type === 'receiveFollowRequest'"
					:class="icon('ph-clock', false)"
				></i>
				<i
					v-else-if="notification.type === 'followRequestAccepted'"
					:class="icon('ph-check', false)"
				></i>
				<i
					v-else-if="notification.type === 'groupInvited'"
					:class="icon('ph-identification-card', false)"
				></i>
				<i
					v-else-if="notification.type === 'renote'"
					:class="icon('ph-rocket-launch', false)"
				></i>
				<i
					v-else-if="notification.type === 'reply'"
					:class="icon('ph-arrow-bend-up-left', false)"
				></i>
				<i
					v-else-if="notification.type === 'mention'"
					:class="icon('ph-at', false)"
				></i>
				<i
					v-else-if="notification.type === 'quote'"
					:class="icon('ph-quotes', false)"
				></i>
				<i
					v-else-if="notification.type === 'pollVote'"
					:class="icon('ph-microphone-stage', false)"
				></i>
				<i
					v-else-if="notification.type === 'pollEnded'"
					:class="icon('ph-microphone-stage', false)"
				></i>
				<!-- notification.reaction が null になることはまずないが、ここでoptional chaining使うと一部ブラウザで刺さるので念の為 -->
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
					:no-style="true"
				/>
				<XReactionIcon
					v-else-if="
						!showEmojiReactions && notification.type === 'reaction'
					"
					:reaction="defaultReaction"
					:no-style="true"
				/>
			</div>
		</div>
		<div class="tail">
			<header>
				<span v-if="notification.type === 'pollEnded'">{{
					i18n.ts._notification.pollEnded
				}}</span>
				<MkA
					v-else-if="'user' in notification"
					v-user-preview="notification.user.id"
					class="name"
					:to="userPage(notification.user)"
					><MkUserName :user="notification.user"
				/></MkA>
				<span v-else>{{ notification.header }}</span>
				<MkTime
					v-if="withTime"
					:time="notification.createdAt"
					class="time"
				/>
			</header>
			<MkA
				v-if="notification.type === 'reaction'"
				class="text"
				:to="notePage(notification.note)"
				:title="getNoteSummary(notification.note)"
			>
				<Mfm
					:text="getNoteSummary(notification.note)"
					:plain="true"
					:nowrap="!full"
					:lang="notification.note.lang"
					:custom-emojis="notification.note.emojis"
				/>
			</MkA>
			<MkA
				v-if="notification.type === 'renote'"
				class="text"
				:to="notePage(notification.note)"
				:title="getNoteSummary(notification.note.renote)"
			>
				<Mfm
					:text="getNoteSummary(notification.note.renote)"
					:plain="true"
					:nowrap="!full"
					:lang="notification.note.lang"
					:custom-emojis="notification.note.renote!.emojis"
				/>
			</MkA>
			<MkA
				v-if="notification.type === 'reply'"
				class="text"
				:to="notePage(notification.note)"
				:title="getNoteSummary(notification.note)"
			>
				<Mfm
					:text="getNoteSummary(notification.note)"
					:plain="true"
					:nowrap="!full"
					:lang="notification.note.lang"
					:custom-emojis="notification.note.emojis"
				/>
			</MkA>
			<MkA
				v-if="notification.type === 'mention'"
				class="text"
				:to="notePage(notification.note)"
				:title="getNoteSummary(notification.note)"
			>
				<Mfm
					:text="getNoteSummary(notification.note)"
					:plain="true"
					:nowrap="!full"
					:lang="notification.note.lang"
					:custom-emojis="notification.note.emojis"
				/>
			</MkA>
			<MkA
				v-if="notification.type === 'quote'"
				class="text"
				:to="notePage(notification.note)"
				:title="getNoteSummary(notification.note)"
			>
				<Mfm
					:text="getNoteSummary(notification.note)"
					:plain="true"
					:nowrap="!full"
					:lang="notification.note.lang"
					:custom-emojis="notification.note.emojis"
				/>
			</MkA>
			<MkA
				v-if="notification.type === 'pollVote'"
				class="text"
				:to="notePage(notification.note)"
				:title="getNoteSummary(notification.note)"
			>
				<Mfm
					:text="getNoteSummary(notification.note)"
					:plain="true"
					:nowrap="!full"
					:lang="notification.note.lang"
					:custom-emojis="notification.note.emojis"
				/>
			</MkA>
			<MkA
				v-if="notification.type === 'pollEnded'"
				class="text"
				:to="notePage(notification.note)"
				:title="getNoteSummary(notification.note)"
			>
				<Mfm
					:text="getNoteSummary(notification.note)"
					:plain="true"
					:nowrap="!full"
					:lang="notification.note.lang"
					:custom-emojis="notification.note.emojis"
				/>
			</MkA>
			<span
				v-if="notification.type === 'follow'"
				class="text"
				style="opacity: 0.7"
				>{{ i18n.ts.youGotNewFollower }}
				<div v-if="full && !hideFollowButton">
					<!-- FIXME: Provide a UserDetailed here -->
					<MkFollowButton
						:user="notification.user"
						:full="true"
						:hide-menu="true"
					/></div
			></span>
			<span
				v-if="notification.type === 'followRequestAccepted'"
				class="text"
				style="opacity: 0.7"
				>{{ i18n.ts.followRequestAccepted }}</span
			>
			<span
				v-if="notification.type === 'receiveFollowRequest'"
				class="text"
				style="opacity: 0.7"
				>{{ i18n.ts.receiveFollowRequest }}
				<div v-if="full && !followRequestDone">
					<button class="_textButton" @click="acceptFollowRequest()">
						{{ i18n.ts.accept }}
					</button>
					|
					<button class="_textButton" @click="rejectFollowRequest()">
						{{ i18n.ts.reject }}
					</button>
				</div></span
			>
			<span
				v-if="notification.type === 'groupInvited'"
				class="text"
				style="opacity: 0.7"
				>{{ i18n.ts.groupInvited }}:
				<b>{{ notification.invitation.group.name }}</b>
				<div v-if="full && !groupInviteDone">
					<button
						class="_textButton"
						@click="acceptGroupInvitation()"
					>
						{{ i18n.ts.accept }}
					</button>
					|
					<button
						class="_textButton"
						@click="rejectGroupInvitation()"
					>
						{{ i18n.ts.reject }}
					</button>
				</div></span
			>
			<span v-if="notification.type === 'app'" class="text">
				<Mfm :text="notification.body" :nowrap="!full" />
			</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, toRef, watch } from "vue";
import type { entities } from "firefish-js";
import type { Connection } from "firefish-js/src/streaming";
import type { Channels } from "firefish-js/src/streaming.types";
import XReactionIcon from "@/components/MkReactionIcon.vue";
import MkFollowButton from "@/components/MkFollowButton.vue";
import XReactionTooltip from "@/components/MkReactionTooltip.vue";
import { getNoteSummary } from "@/scripts/get-note-summary";
import { notePage } from "@/filters/note";
import { userPage } from "@/filters/user";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { useStream } from "@/stream";
import { useTooltip } from "@/scripts/use-tooltip";
import { defaultStore } from "@/store";
import { getInstanceInfo } from "@/instance";
import icon from "@/scripts/icon";

const props = withDefaults(
	defineProps<{
		notification: entities.Notification;
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

const hideFollowButton = defaultStore.state.hideFollowButtons;
const showEmojiReactions =
	defaultStore.state.enableEmojiReactions ||
	defaultStore.state.showEmojisInReactionNotifications;
const realDefaultReaction = getInstanceInfo().defaultReaction;
const defaultReaction = ["⭐", "👍", "❤️"].includes(realDefaultReaction)
	? realDefaultReaction
	: "⭐";

let readObserver: IntersectionObserver | undefined;
let connection: Connection<Channels["main"]> | null = null;

onMounted(() => {
	if (!props.notification.isRead) {
		readObserver = new IntersectionObserver((entries, observer) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			stream.send("readNotification", {
				id: props.notification.id,
			});
			observer.disconnect();
		});

		readObserver.observe(elRef.value!);

		connection = stream.useChannel("main");
		connection.on("readAllNotifications", () => readObserver!.disconnect());

		watch(toRef(props.notification.isRead), () => {
			readObserver!.disconnect();
		});
	}
});

onUnmounted(() => {
	if (readObserver) readObserver.disconnect();
	if (connection) connection.dispose();
});

const followRequestDone = ref(false);
const groupInviteDone = ref(false);

const acceptFollowRequest = () => {
	followRequestDone.value = true;
	os.api("following/requests/accept", {
		userId: (props.notification as entities.ReceiveFollowRequestNotification)
			.user.id,
	});
};

const rejectFollowRequest = () => {
	followRequestDone.value = true;
	os.api("following/requests/reject", {
		userId: (props.notification as entities.ReceiveFollowRequestNotification)
			.user.id,
	});
};

const acceptGroupInvitation = () => {
	groupInviteDone.value = true;
	os.apiWithDialog("users/groups/invitations/accept", {
		invitationId: (props.notification as entities.GroupInvitedNotification)
			.invitation.id,
	});
};

const rejectGroupInvitation = () => {
	groupInviteDone.value = true;
	os.api("users/groups/invitations/reject", {
		invitationId: (props.notification as entities.GroupInvitedNotification)
			.invitation.id,
	});
};

useTooltip(reactionRef, (showing) => {
	const n = props.notification as entities.ReactionNotification;
	os.popup(
		XReactionTooltip,
		{
			showing,
			reaction: n.reaction
				? n.reaction.replace(/^:(\w+):$/, ":$1@.:")
				: n.reaction,
			emojis: n.note.emojis,
			targetElement: reactionRef.value!.$el,
		},
		{},
		"closed",
	);
});
</script>

<style lang="scss" scoped>
.qglefbjs {
	position: relative;
	box-sizing: border-box;
	padding-block: 24px;
	padding-inline: 32px;
	font-size: 0.9em;
	overflow-wrap: break-word;
	display: flex;
	contain: content;

	&.max-width_500px {
		padding-block: 16px;
		font-size: 0.9em;
	}
	&.max-width_450px {
		padding-block: 12px;
		padding-inline: 16px;
	}

	> .head {
		position: sticky;
		inset-block-start: 0;
		flex-shrink: 0;
		inline-size: 42px;
		block-size: 42px;
		margin-inline-end: 8px;

		> .icon {
			display: block;
			inline-size: 100%;
			block-size: 100%;
			border-radius: 6px;
		}

		> .sub-icon {
			position: absolute;
			z-index: 1;
			inset-block-end: -2px;
			inset-inline-end: -2px;
			inline-size: 20px;
			block-size: 20px;
			box-sizing: border-box;
			border-radius: 100%;
			background: var(--panel);
			box-shadow: 0 0 0 3px var(--panel);
			font-size: 12px;
			text-align: center;

			&:empty {
				display: none;
			}

			> * {
				color: #fff;
				inline-size: 100%;
				block-size: 100%;
			}

			&.follow,
			&.followRequestAccepted,
			&.receiveFollowRequest,
			&.groupInvited {
				padding: 3px;
				background: #36aed2;
				pointer-events: none;
			}

			&.renote {
				padding: 3px;
				background: #36d298;
				pointer-events: none;
			}

			&.quote {
				padding: 3px;
				background: #31748f;
				pointer-events: none;
			}

			&.reply {
				padding: 3px;
				background: #c4a7e7;
				pointer-events: none;
			}

			&.mention {
				padding: 3px;
				background: #908caa;
				pointer-events: none;
			}

			&.pollVote {
				padding: 3px;
				background: #908caa;
				pointer-events: none;
			}

			&.pollEnded {
				padding: 3px;
				background: #908caa;
				pointer-events: none;
			}
		}
	}

	> .tail {
		flex: 1;
		min-inline-size: 0;

		> header {
			display: flex;
			align-items: baseline;
			white-space: nowrap;

			> .name {
				text-overflow: ellipsis;
				white-space: nowrap;
				min-inline-size: 0;
				overflow: hidden;
			}

			> .time {
				margin-inline-start: auto;
				font-size: 0.9em;
			}
		}

		> .text {
			white-space: nowrap;
			display: -webkit-box;
			-webkit-line-clamp: 3;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;

			> i {
				vertical-align: super;
				font-size: 50%;
				opacity: 0.5;
			}

			> i:first-child {
				margin-inline-end: 4px;
			}

			> i:last-child {
				margin-inline-start: 4px;
			}
		}
	}
}
</style>
