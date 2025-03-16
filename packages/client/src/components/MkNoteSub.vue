<template>
	<MkLoading v-if="conversationLoading" />
	<article
		v-else-if="!muted.muted || muted.what === 'reply'"
		:id="detailedView ? appearNote.id : undefined"
		ref="el"
		v-size="{ max: [450, 500] }"
		class="wrpstxzv"
		tabindex="-1"
		:class="{
			children: depth > 1,
			singleStart: replies.length == 1,
			firstColumn: depth == 1 && conversation,
		}"
		@contextmenu.stop="onContextmenu"
	>
		<div v-if="conversation && depth > 1" class="line"></div>
		<div
			class="main"
			:style="{ cursor: expandOnNoteClick ? 'pointer' : '' }"
			@click="noteClick"
		>
			<div class="avatar-container">
				<MkAvatar class="avatar" :user="appearNote.user" />
				<div
					v-if="conversation == null || replies.length > 0"
					class="line"
				></div>
			</div>
			<div class="body">
				<XNoteHeader class="header" :note="note" :mini="true" />
				<div class="body">
					<XNoteContent
						class="text"
						:note="note"
						:parent-id="parentId"
						:conversation="conversation"
						:detailed-view="detailedView"
						@focusfooter="footerEl!.focus()"
					/>
					<XNoteTranslation ref="noteTranslation" :note="note"/>
				</div>
				<XNoteFooter
					class="footer"
					ref="footerEl"
					:note="appearNote"
					:enableEmojiReactions
					:hideEmojiViewer
					:detailedView
					:note-translation="noteTranslation"
					@deleted="isDeleted = true"
					@event:focus="focus"
					@event:blur="blur"
				/>
			</div>
		</div>
		<MkLoading v-if="conversationLoading" />
		<template v-else-if="conversation">
			<template
				v-if="replyLevel < REPLY_LEVEL_UPPERBOUND && depth < DEPTH_UPPERBOUND"
			>
				<MkNoteSub
					v-for="reply in replies.slice(0, REPLIES_LIMIT)"
					:key="reply.id"
					:note="reply"
					class="reply"
					:class="{ single: replies.length == 1 }"
					:conversation="conversation"
					:depth="replies.length == 1 ? depth : depth + 1"
					:reply-level="replyLevel + 1"
					:parent-id="appearNote.id"
					:detailed-view="detailedView"
					:auto-add-replies="true"
				/>
				<div v-if="hasMoreReplies" class="more">
					<div class="line"></div>
					<MkA class="text _link" :to="notePage(note)"
						>{{ i18n.ts.continueThread }}
						<i :class="icon('ph-caret-double-right')"></i
					></MkA>
				</div>
			</template>
			<div v-else-if="replies.length > 0" class="more">
				<div class="line"></div>
				<MkA class="text _link" :to="notePage(note)"
					>{{ i18n.ts.continueThread }}
					<i :class="icon('ph-caret-double-right')"></i
				></MkA>
			</div>
		</template>
	</article>
	<div v-else class="muted" @click="muted.muted = false">
		<I18n :src="softMuteReasonI18nSrc(muted.what)" tag="small">
			<template #name>
				<MkA
					v-user-preview="note.userId"
					class="name"
					:to="userPage(note.user)"
				>
					<MkUserName :user="note.user" />
				</MkA>
			</template>
			<template #reason>
				<b class="_blur_text">{{ muted.matched.join(", ") }}</b>
			</template>
		</I18n>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { entities } from "firefish-js";
import XNoteHeader from "@/components/note/MkNoteHeader.vue";
import XNoteContent from "@/components/note/MkNoteContent.vue";
import { getWordSoftMute } from "@/scripts/check-word-mute";
import { notePage } from "@/filters/note";
import { useRouter } from "@/router";
import { userPage } from "@/filters/user";
import * as os from "@/os";
import { me } from "@/me";
import { i18n } from "@/i18n";
import { useNoteCapture } from "@/scripts/use-note-capture";
import { defaultStore } from "@/store";
import { deepClone } from "@/scripts/clone";
import icon from "@/scripts/icon";
import XNoteFooter from "./note/MkNoteFooter.vue";
import XNoteTranslation from "./note/MkNoteTranslation.vue";
import { showNoteContextMenu } from "@/scripts/show-note-context-menu";

const router = useRouter();

const REPLIES_LIMIT = 10;
const REPLY_LEVEL_UPPERBOUND = 11;
const DEPTH_UPPERBOUND = 5;

const props = withDefaults(
	defineProps<{
		note: entities.Note;
		conversation?: entities.Note[];
		autoConversation?: boolean;
		parentId?: string;
		detailedView?: boolean;
		// how many notes are in between this one and the note being viewed in detail
		depth?: number;
		// the actual reply level of this note within the conversation thread
		replyLevel?: number;
		autoAddReplies?: boolean;
		hideEmojiViewer?: boolean;
	}>(),
	{
		depth: 1,
		replyLevel: 1,
		autoAddReplies: false,
	},
);

const note = ref(deepClone(props.note));

const softMuteReasonI18nSrc = (what?: string) => {
	if (what === "note") return i18n.ts.userSaysSomethingReason;
	if (what === "reply") return i18n.ts.userSaysSomethingReasonReply;
	if (what === "renote") return i18n.ts.userSaysSomethingReasonRenote;
	if (what === "quote") return i18n.ts.userSaysSomethingReasonQuote;

	// I don't think here is reachable, but just in case
	return i18n.ts.userSaysSomething;
};

const conversation = ref(props.conversation);
const conversationLoading = ref(false);
const replies = ref<entities.Note[]>([]);
const hasMoreReplies = ref(false);

function updateReplies() {
	replies.value = (conversation.value ?? [])
		.filter(
			(item) =>
				item.replyId === props.note.id || item.renoteId === props.note.id,
		)
		.reverse();
	hasMoreReplies.value = replies.value.length >= REPLIES_LIMIT + 1;
}

watch(conversation, updateReplies, {
	immediate: true,
});

if (props.autoConversation) {
	conversation.value = [];
	if (note.value.repliesCount > 0 || note.value.renoteCount > 0) {
		conversationLoading.value = true;
		os.api("notes/children", {
			noteId: note.value.id,
			limit: REPLIES_LIMIT + 1,
			depth: REPLY_LEVEL_UPPERBOUND + 1,
		}).then((res) => {
			conversation.value = res
				.filter((n) => n.userId !== note.value.userId)
				.reverse()
				.concat(res.filter((n) => n.userId === note.value.userId));
			conversationLoading.value = false;
		});
	}
}

const isRenote =
	note.value.renote != null &&
	note.value.text == null &&
	note.value.fileIds.length === 0 &&
	note.value.poll == null;

const el = ref<HTMLElement | null>(null);
const noteTranslation = ref<InstanceType<typeof XNoteTranslation> | null>(null);
const footerEl = ref<InstanceType<typeof XNoteFooter> | null>(null);
const appearNote = computed(() =>
	isRenote ? (note.value.renote as entities.Note) : note.value,
);
const isDeleted = ref(false);
const muted = ref(
	getWordSoftMute(
		note.value,
		me?.id,
		defaultStore.state.mutedWords,
		defaultStore.state.mutedLangs,
	),
);
const enableEmojiReactions = defaultStore.state.enableEmojiReactions;
const expandOnNoteClick = defaultStore.state.expandOnNoteClick;

useNoteCapture({
	rootEl: el,
	note: appearNote,
	isDeletedRef: isDeleted,
	onReplied: (note) => {
		if (props.autoAddReplies !== true) {
			return;
		}
		if (hasMoreReplies.value === false) {
			conversation.value = (conversation.value ?? []).concat([note]);
		}
	},
});

function onContextmenu(ev: MouseEvent): void {
	showNoteContextMenu({
		ev,
		note: appearNote.value,
		react: footerEl.value!.react,
	});
}

function focus() {
	el.value!.focus();
}

function blur() {
	el.value!.blur();
}

function noteClick(e: MouseEvent) {
	if (document.getSelection()?.type === "Range" || !expandOnNoteClick) {
		e.stopPropagation();
	} else {
		router.push(notePage(props.note));
	}
}
</script>

<style lang="scss" scoped>
.wrpstxzv {
	padding-block: 16px;
	padding-inline: 32px;
	outline: none;
	&.children {
		padding-block-start: 10px;
		padding-inline-end: 0;
		padding-block-end: 0;
		padding-inline-start: var(--indent);
		padding-inline-start: var(--indent) !important;
		font-size: 1em;
		cursor: auto;

		&.max-width_500px {
			padding-block-start: 10px;
			padding-inline-end: 0;
			padding-block-end: 0;
			padding-inline-start: 8px;
		}
	}

	> .main {
		display: flex;

		> .avatar-container {
			margin-inline-end: 8px;
			z-index: 2;
			> .avatar {
				flex-shrink: 0;
				display: block;
				inline-size: 38px;
				block-size: 38px;
				border-radius: 8px;
			}
		}

		> .body {
			position: relative;
			flex: 1;
			min-inline-size: 0;
			margin-block: 0;
			margin-inline: -200px;
			padding-block: 0;
			padding-inline: 200px;
			overflow: clip;
			@media (pointer: coarse) {
				cursor: default;
			}

			> .header {
				margin-block-end: 2px;
				cursor: auto;
			}
			> .footer {
				position: relative;
				z-index: 2;
				display: flex;
				flex-wrap: wrap;

				> :deep(.button) {
					position: relative;
					margin: 0;
					padding: 8px;
					opacity: 0.7;

					flex-grow: 1;
					max-inline-size: 3.5em;
					inline-size: max-content;
					min-inline-size: max-content;
					block-size: auto;
					transition: opacity 0.2s;

					&:disabled {
						opacity: 0.3 !important;
					}

					&::before {
						content: "";
						position: absolute;
						inset: 0;
						inset-block-end: 2px;
						background: var(--panel);
						z-index: -1;
						transition: background 0.2s;
					}

					&:first-of-type {
						margin-inline-start: -0.5em;
						&::before {
							border-radius: 100px 0 0 100px;
						}
					}

					&:last-of-type {
						&::before {
							border-radius: 0 100px 100px 0;
						}
					}

					&:hover {
						color: var(--fgHighlighted);
					}

					> i {
						display: inline !important;
					}

					> .count {
						display: inline;
						margin-block-start: 0;
						margin-inline-end: 0;
						margin-block-end: 0;
						margin-inline-start: 8px;
						opacity: 0.7;
					}

					&.reacted {
						color: var(--accent);
					}
				}
			}
		}
	}

	&.reply > .main {
		margin-inline: -200px;
		padding-inline: 200px;
		&::before {
			inset-inline: 176px !important;
		}
	}
	&.reply,
	&.reply-to {
		> .main > .body {
			margin-inline-end: -24px;
			padding-inline-end: 24px;
			margin-block-start: -12px;
			padding-block-start: 12px;
			margin-inline-start: calc(0px - var(--avatarSize) - 32px);
			padding-inline-start: calc(var(--avatarSize) + 32px);
			border-radius: var(--radius);
		}
	}
	&.reply-to {
		> .main > .body {
			margin-inline-start: calc(0px - var(--avatarSize) - 38px);
			padding-inline-start: calc(var(--avatarSize) + 38px);
			margin-block-start: -16px;
			padding-block-start: 16px;
		}
	}
	&.reply {
		--avatarSize: 38px;
		.avatar-container {
			margin-inline-end: 8px !important;
		}
	}
	> .reply,
	> .more {
		margin-block-start: 10px;
		&.single {
			padding: 0 !important;
			> .line {
				display: none;
			}
		}
	}

	> .more {
		display: flex;
		padding-block: 10px;
		font-weight: 600;
		> .line {
			position: relative;
			z-index: 2;
			flex-grow: 0 !important;
			margin-block-start: -10px !important;
			margin-block-end: 10px !important;
			margin-inline-end: 10px !important;
			&::before {
				border-inline-start-style: dashed !important;
				border-end-start-radius: 100px !important;
			}
		}
		i {
			font-size: 1em !important;
			vertical-align: middle !important;
		}
		a {
			position: static;
			&::before {
				content: "";
				position: absolute;
				inset: 0;
			}
			&::after {
				content: unset;
			}
		}
	}

	&.reply,
	&.reply-to,
	&.reply-to-more {
		> .main:hover,
		> .main:focus-within {
			:deep(.footer .button) {
				opacity: 1;
			}
		}
	}

	&.reply-to,
	&.reply-to-more {
		padding-block-end: 0;
		&:first-child {
			padding-block-start: 24px;
		}
		.line::before {
			margin-block-end: -16px;
		}
	}

	// Reply Lines
	&.reply,
	&.reply-to,
	&.reply-to-more {
		--indent: calc(var(--avatarSize) - 5px);
		> .main {
			> .avatar-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-inline-end: 14px;
				inline-size: var(--avatarSize);
				> .avatar {
					inline-size: var(--avatarSize);
					block-size: var(--avatarSize);
					margin: 0;
				}
			}
		}
		.line {
			position: relative;
			z-index: 2;
			inline-size: var(--avatarSize);
			display: flex;
			flex-grow: 1;
			margin-block-end: -10px;
			pointer-events: none;
			opacity: 0.25;
			&::before {
				content: "";
				position: absolute;
				border-inline-start: 2px solid currentColor;
				margin-inline-start: calc((var(--avatarSize) / 2) - 1px);
				inline-size: calc(var(--indent) / 2);
				inset-block: 0;
				min-block-size: 8px;
			}
		}
	}
	&.reply-to,
	&.reply-to-more {
		> .main > .avatar-container > .line {
			margin-block-end: 0px !important;
		}
	}
	&.single,
	&.singleStart {
		> .main > .avatar-container > .line {
			margin-block-end: -10px !important;
		}
	}
	.reply.children:not(:last-child) {
		// Line that goes through multiple replies
		position: relative;
		> .line {
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: 0;
			inset-block-end: 0;
		}
	}
	// Reply line connectors
	.reply.children:not(.single) {
		position: relative;
		> .line {
			position: absolute;
			z-index: 2;
			inset-inline-start: 0;
			inset-block-start: 0;
			opacity: 0.25;
			&::after {
				content: "";
				position: absolute;
				border-inline-start: 2px solid currentColor;
				border-block-end: 2px solid currentColor;
				margin-inline-start: calc((var(--avatarSize) / 2) - 1px);
				inline-size: calc(var(--indent) / 2);
				block-size: calc((var(--avatarSize) / 2));
				border-end-start-radius: calc(var(--indent) / 2);
				inset-block-start: 8px;
			}
		}
		&:not(:last-child) > .line::after {
			mask: linear-gradient(var(--gradient-to-inline-end) transparent 2px, black 2px),;
			-webkit-mask: linear-gradient(var(--gradient-to-inline-end) transparent 2px, black 2px),;
		}
	}
	// End Reply Divider
	.children > .main:last-child {
		padding-block-end: 1em;
		&::before {
			inset-block-end: 1em;
		}
		// &::after {
		// 	content: "";
		// 	border-block-start: 1px solid var(--X13);
		// 	position: absolute;
		// 	inset-block-end: 0;
		// 	margin-inline-start: calc(var(--avatarSize) + 12px);
		// 	inset-inline: 0;
		// }
	}
	&.firstColumn > .children:last-child > .main {
		padding-block-end: 0 !important;
		&::before {
			inset-block-end: 0 !important;
		}
		// &::after { content: unset }
	}

	&.max-width_500px {
		padding-block: 14px;
		padding-inline: 16px;
		:not(.reply) > & {
			.reply {
				--avatarSize: 24px;
				--indent: calc(var(--avatarSize) - 4px);
			}
		}
		&.firstColumn {
			> .main,
			> .line,
			> .children:not(.single) > .line {
				--avatarSize: 35px;
				--indent: 35px;
			}
			> .children:not(.single) {
				padding-inline-start: 28px !important;
			}
		}
		&.reply-to {
			--avatarSize: 46px;
			padding-block: 14px;
			padding-inline: 16px;
			padding-block-start: 14px !important;
			padding-block-end: 0 !important;
			margin-block-end: 0 !important;
		}
		> .main > .avatar-container {
			margin-inline-end: 10px;
		}
		&:first-child > .main > .body {
			margin-block-start: -20px;
			padding-block-start: 22px;
		}
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
}
</style>
