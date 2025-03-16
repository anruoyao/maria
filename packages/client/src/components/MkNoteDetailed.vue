<template>
	<div
		v-if="!muted.muted"
		v-show="!isDeleted"
		ref="el"
		v-hotkey="keymap"
		v-size="{ max: [500, 350, 300] }"
		class="lxwezrsl _block"
		:tabindex="!isDeleted ? '-1' : undefined"
		:class="{ renote: isRenote }"
	>
		<MkNoteSub
			v-for="note in conversation"
			v-if="conversation"
			:key="note.id"
			class="reply-to"
			:note="note"
			:detailed-view="true"
		/>
		<MkLoading v-else-if="note.reply" mini />
		<MkNoteSub
			v-if="note.reply"
			:note="note.reply"
			class="reply-to"
			:detailed-view="true"
		/>

		<MkNote
			ref="noteEl"
			tabindex="-1"
			:note="note"
			detailed-view
			@contextmenu.stop="onContextmenu"
		></MkNote>

		<MkTab v-model="tab" :style="'underline'">
			<option value="replies">
				<!-- <i :class="icon('ph-arrow-u-up-left')"></i> -->
				{{
					wordWithCount(
						note.repliesCount,
						i18n.ts.reply,
						i18n.ts.replies,
					)
				}}
			</option>
			<option v-if="note.renoteCount > 0" value="renotes">
				<!-- <i :class="icon('ph-rocket-launch')"></i> -->
				{{
					wordWithCount(
						note.renoteCount,
						i18n.ts.renote,
						i18n.ts.renotes,
					)
				}}
			</option>
			<option v-if="reactionsCount > 0" value="reactions">
				<!-- <i :class="icon('ph-smiley')"></i> -->
				{{
					wordWithCount(
						reactionsCount,
						i18n.ts.reaction,
						i18n.ts.reactions,
					)
				}}
			</option>
			<option v-if="note.quoteCount > 0" value="quotes">
				<!-- <i :class="icon('ph-quotes')"></i> -->
				{{
					wordWithCount(
						note.quoteCount,
						i18n.ts.quote,
						i18n.ts.quotes,
					)
				}}
			</option>
			<option v-if="clips?.length > 0" value="clips">
				<!-- <i :class="icon('ph-paperclip')"></i> -->
				{{ wordWithCount(clips.length, i18n.ts.clip, i18n.ts.clips) }}
			</option>
		</MkTab>

		<MkPagination
			v-if="tab === 'replies' && note.repliesCount > 0"
			ref="repliesPagingComponent"
			v-slot="{ items }"
			:pagination="repliesPagination"
		>
			<MkNoteSub
				v-for="note in items"
				:key="note.id"
				:note="note"
				class="reply"
				:auto-conversation="true"
				:detailed-view="true"
				:parent-id="note.id"
				:auto-add-replies="true"
			/>
		</MkPagination>

		<MkPagination
			v-if="tab === 'quotes'"
			v-slot="{ items }"
			:pagination="quotePagination"
		>
			<MkNoteSub
				v-for="note in items"
				:key="note.id"
				:note="note"
				class="reply"
				:auto-conversation="true"
				:detailed-view="true"
				:parent-id="note.id"
				:auto-add-replies="true"
			/>
		</MkPagination>

		<MkPagination
			v-if="tab === 'renotes'"
			v-slot="{ items }"
			:pagination="renotePagination"
		>
			<MkUserCardMini
				v-for="item in items"
				:key="item.user.id"
				:user="item.user"
			/>
		</MkPagination>

		<div v-if="tab === 'clips' && clips.length > 0" class="_content clips">
			<MkA
				v-for="item in clips"
				:key="item.id"
				:to="`/clips/${item.id}`"
				class="item _panel"
			>
				<b>{{ item.name }}</b>
				<div v-if="item.description" class="description">
					{{ item.description }}
				</div>
				<div class="user">
					<MkAvatar
						:user="item.user"
						class="avatar"
						:show-indicator="true"
					/>
					<MkUserName :user="item.user" :nowrap="false" />
				</div>
			</MkA>
		</div>
		<MkLoading v-else-if="tab === 'clips' && clips.length > 0" />

		<MkReactedUsers
			v-if="tab === 'reactions' && reactionsCount > 0"
			:note-id="note.id"
		></MkReactedUsers>
	</div>
	<div v-else class="_panel muted" @click="muted.muted = false">
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
import { onMounted, onUpdated, ref } from "vue";
import type { entities } from "firefish-js";
import MkTab from "@/components/MkTab.vue";
import MkNote from "@/components/MkNote.vue";
import MkNoteSub from "@/components/MkNoteSub.vue";
import type XRenoteButton from "@/components/MkRenoteButton.vue";
import MkUserCardMini from "@/components/MkUserCardMini.vue";
import MkReactedUsers from "@/components/MkReactedUsers.vue";
import { pleaseLogin } from "@/scripts/please-login";
import { getWordSoftMute } from "@/scripts/check-word-mute";
import { userPage } from "@/filters/user";
import * as os from "@/os";
import { defaultStore, noteViewInterruptors } from "@/store";
import { reactionPicker } from "@/scripts/reaction-picker";
import { me } from "@/me";
import { i18n } from "@/i18n";
import { getNoteMenu } from "@/scripts/get-note-menu";
import { useNoteCapture } from "@/scripts/use-note-capture";
import { deepClone } from "@/scripts/clone";
import MkPagination, {
	type MkPaginationType,
} from "@/components/MkPagination.vue";
// import icon from "@/scripts/icon";

const props = defineProps<{
	note: entities.Note;
	pinned?: boolean;
}>();

const tab = ref("replies");

const note = ref(deepClone(props.note));

const softMuteReasonI18nSrc = (what?: string) => {
	if (what === "note") return i18n.ts.userSaysSomethingReason;
	if (what === "reply") return i18n.ts.userSaysSomethingReasonReply;
	if (what === "renote") return i18n.ts.userSaysSomethingReasonRenote;
	if (what === "quote") return i18n.ts.userSaysSomethingReasonQuote;

	// I don't think here is reachable, but just in case
	return i18n.ts.userSaysSomething;
};

const wordWithCount = (count: number, singular: string, plural: string) => {
	if (count === 0) return plural;
	return `${count} ${count === 1 ? singular : plural}`;
};

// plugin
if (noteViewInterruptors.length > 0) {
	onMounted(async () => {
		let result = deepClone(note.value);
		for (const interruptor of noteViewInterruptors) {
			result = await interruptor.handler(result);
		}
		note.value = result;
	});
}

const repliesPagingComponent = ref<MkPaginationType<"notes/replies"> | null>(
	null,
);

const el = ref<HTMLElement | null>(null);
const noteEl = ref<InstanceType<typeof MkNote> | null>(null);
const menuButton = ref<HTMLElement>();
const renoteButton = ref<InstanceType<typeof XRenoteButton>>();
const reactButton = ref<HTMLElement>();
// const showContent = ref(false);
const isDeleted = ref(false);
const muted = ref(
	getWordSoftMute(
		note.value,
		me?.id,
		defaultStore.state.mutedWords,
		defaultStore.state.mutedLangs,
	),
);
const translation = ref(null);
const translating = ref(false);
const conversation = ref<null | entities.Note[]>([]);
const clips = ref();
const isRenote = ref(note.value.renoteId != null);
let isScrolling: boolean;

const reactionsCount = Object.values(props.note.reactions).reduce(
	(x, y) => x + y,
	0,
);

const keymap = {
	r: () => reply(true),
	"e|a|plus": () => react(true),
	q: () => renoteButton.value!.renote(true),
	esc: blur,
	"m|o": () => menu(true),
	// s: () => showContent.value !== showContent.value,
};

useNoteCapture({
	rootEl: el,
	note,
	isDeletedRef: isDeleted,
	onReplied: (replyNote) => {
		repliesPagingComponent.value?.append(replyNote);
	},
});

function reply(_viaKeyboard = false): void {
	pleaseLogin();
	os.post({
		reply: note.value,
		// animation: !viaKeyboard,
	}).then(() => {
		focus();
	});
}

function react(_viaKeyboard = false): void {
	pleaseLogin();
	blur();
	reactionPicker.show(
		reactButton.value!,
		(reaction) => {
			os.api("notes/reactions/create", {
				noteId: note.value.id,
				reaction,
			});
		},
		() => {
			focus();
		},
	);
}

// function undoReact(note): void {
// 	const oldReaction = note.myReaction;
// 	if (!oldReaction) return;
// 	os.api("notes/reactions/delete", {
// 		noteId: note.id,
// 	});
// }

function onContextmenu(ev: MouseEvent): void {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === "A") return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target as HTMLElement)) return;
	if (window.getSelection()?.toString() !== "") return;

	if (defaultStore.state.useReactionPickerForContextMenu) {
		ev.preventDefault();
		react();
	} else {
		os.contextMenu(
			getNoteMenu({
				note: note.value,
				translating,
				translation,
				menuButton,
				isDeleted,
			}),
			ev,
		).then(focus);
	}
}

function menu(viaKeyboard = false): void {
	os.popupMenu(
		getNoteMenu({
			note: note.value,
			translating,
			translation,
			menuButton,
			isDeleted,
		}),
		menuButton.value,
		{
			viaKeyboard,
		},
	).then(focus);
}

function focus() {
	noteEl.value?.focus();
}

function blur() {
	noteEl.value?.blur();
}

conversation.value = null;
if (note.value.replyId) {
	os.api("notes/conversation", {
		noteId: note.value.replyId,
		limit: 30,
	}).then((res) => {
		conversation.value = res.reverse();
		focus();
	});
}

clips.value = null;
os.api("notes/clips", {
	noteId: note.value.id,
}).then((res) => {
	clips.value = res;
});

const repliesPagination = {
	endpoint: "notes/replies" as const,
	limit: 10,
	params: {
		noteId: note.value.id,
	},
	ascending: true,
};

const renotePagination = {
	endpoint: "notes/renotes" as const,
	limit: 30,
	params: {
		noteId: note.value.id,
		filter: "renote" as const,
	},
};
const quotePagination = {
	endpoint: "notes/renotes" as const,
	limit: 30,
	params: {
		noteId: note.value.id,
		filter: "quote" as const,
	},
};

document.addEventListener("wheel", () => {
	isScrolling = true;
});

onMounted(() => {
	isScrolling = false;
	noteEl.value?.scrollIntoView();
});

onUpdated(() => {
	if (!isScrolling) {
		noteEl.value?.scrollIntoView();
		if (location.hash) {
			location.replace(location.hash); // Jump to highlighted reply
		}
	}
});
</script>

<style lang="scss" scoped>
.lxwezrsl {
	font-size: 1.05em;
	position: relative;
	transition: box-shadow 0.1s ease;
	contain: content;

	&:focus-visible {
		outline: none;

		&:after {
			content: "";
			pointer-events: none;
			display: block;
			position: absolute;
			z-index: 10;
			inset: 0;
			margin: auto;
			inline-size: calc(100% - 8px);
			block-size: calc(100% - 8px);
			border: solid 1px var(--focus);
			border-radius: var(--radius);
			box-sizing: border-box;
		}
	}

	> .reply-to {
		margin-block-end: -16px;
		padding-block-end: 16px;
	}

	> :deep(.note-container) {
		padding-block: 28px 0;
		padding-block-start: 12px;
		font-size: 1.1rem;
		overflow: clip;
		outline: none;
		scroll-margin-block-start: calc(var(--stickyTop) + 20vb);
		&:not(:last-child) {
			border-block-end: 1px solid var(--divider);
			margin-block-end: 4px;
		}
		.article {
			cursor: unset;
			padding-block-end: 0;
		}
		&:first-child {
			padding-block-start: 28px;
		}
	}

	> :deep(.chips) {
		padding-block: 6px 12px;
		padding-inline-start: 32px;
		&:last-child {
			margin-block-end: 12px;
		}
	}
	> :deep(.user-card-mini),
	> :deep(.reacted-users > *) {
		padding-inline: 32px;
		border-block-start: 1px solid var(--divider);
		border-radius: 0;
	}
	> :deep(.reacted-users > div) {
		padding-block: 12px;
	}

	> .reply {
		border-block-start: solid 0.5px var(--divider);
		padding-block-start: 24px;
		padding-block-end: 10px;
	}

	// Hover
	:deep(.reply > .main),
	.reply-to,
	:deep(.more) {
		position: relative;
		&::before {
			content: "";
			position: absolute;
			inset: -12px -24px;
			inset-block-end: -0px;
			background: var(--panelHighlight);
			border-radius: var(--radius);
			opacity: 0;
			transition:
				opacity 0.2s,
				background 0.2s;
			z-index: -1;
		}
		&.reply-to {
			&::before {
				inset: 0px 8px;
			}
			&:not(.max-width_500px)::before {
				inset-block-end: 16px;
			}
			&:first-of-type::before {
				inset-block-start: 12px;
			}
			&.reply.max-width_500px:first-of-type::before {
				inset-block-start: 4px;
			}
		}
		// &::after {
		// 	content: "";
		// 	position: absolute;
		// 	inset: -9999px;
		// 	background: var(--modalBg);
		// 	opacity: 0;
		// 	z-index: -2;
		// 	pointer-events: none;
		// 	transition: opacity .2s;
		// }
		&.more::before {
			inset: 0 !important;
		}
		&:hover,
		&:focus-within {
			--panel: var(--panelHighlight);
			&::before {
				opacity: 1;
				background: var(--panelHighlight) !important;
			}
		}
		// @media (pointer: coarse) {
		// 	&:has(.button:focus-within) {
		// 		z-index: 2;
		// 		--X13: transparent;
		// 		&::after {
		// 			opacity: 1;
		// 			backdrop-filter: var(--modalBgFilter);
		// 		}
		// 	}
		// }
	}
	:deep(.reply:target > .main),
	:deep(.reply-to:target) {
		z-index: 2;
		&::before {
			outline: auto;
			opacity: 1;
			background: none;
		}
	}
	&.max-width_500px {
		font-size: 0.975em;
		> .reply-to {
			&::before {
				inset-inline: -24px;
			}
			&:first-child {
				padding-block-start: 14px;
				&::before {
					inset-block-start: -24px;
				}
			}
		}

		> :deep(.note-container) {
			padding-block-start: 12px;
			padding-inline-end: 0;
			padding-block-end: 0;
			padding-inline-start: 0;
			font-size: 1.05rem;
			> .header > .body {
				padding-inline-start: 10px;
			}
		}
		> .clips,
		> :deep(.user-card-mini),
		> :deep(.reacted-users > *) {
			padding-inline: 16px !important;
		}
		> :deep(.underline) {
			padding-inline-start: 16px !important;
		}
	}

	&.max-width_300px {
		font-size: 0.825em;
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
}

.clips {
	// want to redesign at some point
	padding-block: 24px;
	padding-inline: 32px;
	padding-block-start: 0;
	> .item {
		display: block;
		padding: 16px;
		// background: var(--buttonBg);
		border: 1px solid var(--divider);
		margin-block-end: var(--margin);
		transition: background 0.2s;
		&:hover,
		&:focus-within {
			background: var(--panelHighlight);
		}

		> .description {
			padding-block: 8px;
			padding-inline: 0;
		}

		> .user {
			$height: 32px;
			padding-block-start: 16px;
			border-block-start: solid 0.5px var(--divider);
			line-height: $height;

			> .avatar {
				inline-size: $height;
				block-size: $height;
			}
		}
	}
}
</style>
