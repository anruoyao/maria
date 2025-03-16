<template>
	<div
		v-if="!muted.muted"
		v-show="!isDeleted && renotes?.length !== 0"
		:id="appearNote.historyId || appearNote.id"
		ref="el"
		v-hotkey="keymap"
		v-size="{ max: [500, 350] }"
		v-vibrate="5"
		:aria-label="accessibleLabel"
		class="tkcbzcuz note-container"
		:tabindex="!isDeleted ? '-1' : undefined"
		:class="{ renote: isRenote || (renotes && renotes.length > 0) }"
	>
		<MkNoteSub
			v-if="
				appearNote.reply && !detailedView && !collapsedReply && !parents
			"
			:note="appearNote.reply"
			class="reply-to"
		/>
		<MkNoteSub
			v-for="n of parents"
			v-else-if="!detailedView && !collapsedReply && parents"
			:key="n.id"
			:note="n"
			class="reply-to"
		/>
		<div
			v-if="!detailedView"
			class="note-context"
			:class="{
				collapsedReply: collapsedReply && appearNote.reply,
			}"
			@click="noteClick"
		>
			<XNoteHeaderInfo v-bind="{ appearNote, note, collapsedReply, pinned }" />
			<XRenoteBar
				v-bind="{ appearNote, note, isRenote, renotes }"
				@deleted="isDeleted = true"
			/>
		</div>
		<article
			class="article"
			:style="{
				cursor: expandOnNoteClick && !detailedView ? 'pointer' : '',
			}"
			:class="{
				history: appearNote.historyId,
			}"
			@contextmenu.stop="onContextmenu"
			@click="noteClick"
		>
			<div class="main">
				<div class="header-container">
					<MkAvatar class="avatar" :user="appearNote.user" />
					<XNoteHeader
						class="header"
						:note="appearNote"
						:can-open-server-info="true"
					/>
				</div>
				<div class="body">
					<XNoteContent
						class="text"
						:note="appearNote"
						:detailed="true"
						:detailed-view="detailedView"
						:parent-id="appearNote.id"
						:is-long-judger="isLongJudger"
						@push="(e) => router.push(notePage(e))"
						@focusfooter="footerEl!.focus()"
						@expanded="(e) => setPostExpanded(e)"
					></XNoteContent>
					<XNoteTranslation ref="noteTranslation" :note="note"/>
				</div>
				<XNoteFooterInfo class="info" :note="appearNote" :detailedView />
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
		</article>
	</div>
	<button
		v-else
		class="muted _button"
		@click="muted.muted = false"
		@contextmenu.stop.prevent
	>
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
	</button>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import type { entities } from "firefish-js";
import XNoteContent from "@/components/note/MkNoteContent.vue";
import MkNoteSub from "@/components/MkNoteSub.vue";
import XNoteHeader from "@/components/note/MkNoteHeader.vue";
import { focusNext, focusPrev } from "@/scripts/focus";
import { getWordSoftMute } from "@/scripts/check-word-mute";
import { useRouter } from "@/router";
import { userPage } from "@/filters/user";
import { defaultStore, noteViewInterruptors } from "@/store";
import { me } from "@/me";
import { i18n } from "@/i18n";
import { useNoteCapture } from "@/scripts/use-note-capture";
import { notePage } from "@/filters/note";
import { deepClone } from "@/scripts/clone";
import type { NoteType } from "@/types/note";
import { isDeleted as _isDeleted, isRenote as _isRenote } from "@/scripts/note";
import XNoteHeaderInfo from "@/components/note/MkNoteHeaderInfo.vue";
import XNoteFooterInfo from "@/components/note/MkNoteFooterInfo.vue";
import XRenoteBar from "@/components/note/MkRenoteBar.vue";
import XNoteFooter from "./note/MkNoteFooter.vue";
import XNoteTranslation from "./note/MkNoteTranslation.vue";
import { showNoteContextMenu } from "@/scripts/show-note-context-menu";

const props = defineProps<{
	note: NoteType;
	parents?: NoteType[];
	renotes?: entities.Note[];
	pinned?: boolean;
	detailedView?: boolean;
	collapsedReply?: boolean;
	hideFooter?: boolean;
	hideEmojiViewer?: boolean;
	isLongJudger?: (note: entities.Note) => boolean;
}>();

// #region Constants
const router = useRouter();
const keymap = {
	r: () => footerEl.value!.reply(true),
	"e|a|plus": () => footerEl.value!.react(true),
	q: () => footerEl.value!.renote(true),
	"up|k": focusBefore,
	"down|j": focusAfter,
	esc: blur,
	"m|o": () => footerEl.value!.menu(true),
	// FIXME: What's this?
	// s: () => showContent.value !== showContent.value,
};
const el = ref<HTMLElement | null>(null);
const footerEl = ref<InstanceType<typeof XNoteFooter> | null>(null);
const enableEmojiReactions = defaultStore.reactiveState.enableEmojiReactions;
const expandOnNoteClick = defaultStore.reactiveState.expandOnNoteClick;
const noteTranslation = ref<InstanceType<typeof XNoteTranslation> | null>(null);
// #endregion

// #region Variables bound to Notes
let capture: ReturnType<typeof useNoteCapture> | undefined;
const note = ref(deepClone(props.note));
const postIsExpanded = ref(false);
const isDeleted = ref(false);
const renotes = ref(props.renotes?.filter((rn) => !_isDeleted(rn.id)));
const muted = ref(
	getWordSoftMute(
		note.value,
		me?.id,
		defaultStore.reactiveState.mutedWords.value,
		defaultStore.reactiveState.mutedLangs.value,
	),
);
// #endregion

// #region computed
const isRenote = computed(() => _isRenote(note.value));
const appearNote = computed(() =>
	isRenote.value ? (note.value.renote as NoteType) : note.value,
);
const accessibleLabel = computed(() => {
	let label = `${appearNote.value.user.username}; `;
	if (appearNote.value.renote) {
		label += `${i18n.ts.renoted} ${appearNote.value.renote.user.username}; `;
		if (appearNote.value.renote.cw) {
			label += `${i18n.ts.cw}: ${appearNote.value.renote.cw}; `;
			if (postIsExpanded.value) {
				label += `${appearNote.value.renote.text}; `;
			}
		} else {
			label += `${appearNote.value.renote.text}; `;
		}
	} else {
		if (appearNote.value.cw) {
			label += `${i18n.ts.cw}: ${appearNote.value.cw}; `;
			if (postIsExpanded.value) {
				label += `${appearNote.value.text}; `;
			}
		} else {
			label += `${appearNote.value.text}; `;
		}
	}
	const date = new Date(appearNote.value.createdAt);
	label += `${date.toLocaleTimeString()}`;
	return label;
});
// #endregion

async function pluginInit(newNote: NoteType) {
	// plugin
	if (noteViewInterruptors.length > 0) {
		let result = deepClone(newNote);
		for (const interruptor of noteViewInterruptors) {
			result = await interruptor.handler(result);
		}
		note.value = result;
	}
}

function recalculateRenotes() {
	renotes.value = props.renotes?.filter((rn) => !_isDeleted(rn.id));
}

async function init(newNote: NoteType, first = false) {
	if (!first) {
		// plugin
		if (noteViewInterruptors.length > 0) {
			await pluginInit(newNote);
		} else {
			note.value = deepClone(newNote);
		}
	}
	postIsExpanded.value = false;
	isDeleted.value = _isDeleted(note.value.id);
	if (appearNote.value.historyId == null) {
		capture?.close();
		capture = useNoteCapture({
			rootEl: el,
			note: appearNote,
			isDeletedRef: isDeleted,
		});
		if (isRenote.value === true) {
			useNoteCapture({
				rootEl: el,
				note,
				isDeletedRef: isDeleted,
			});
		}
		if (props.renotes) {
			const renoteDeletedTrigger = ref(false);
			for (const renote of props.renotes) {
				useNoteCapture({
					rootEl: el,
					note: ref(renote),
					isDeletedRef: renoteDeletedTrigger,
				});
			}
			watch(renoteDeletedTrigger, recalculateRenotes);
		}
	}
}

init(props.note, true);

onMounted(() => {
	pluginInit(note.value);
});

watch(isDeleted, () => {
	if (isDeleted.value === true) {
		if (props.parents && props.parents.length > 0) {
			let noteTakePlace: NoteType | null = null;
			while (noteTakePlace == null || _isDeleted(noteTakePlace.id)) {
				if (props.parents.length === 0) {
					return;
				}
				noteTakePlace = props.parents[props.parents.length - 1];
				props.parents.pop();
			}
			noteTakePlace.repliesCount -= 1;
			init(noteTakePlace);
			isDeleted.value = false;
		}
	}
});

watch(
	() => props.note.id,
	(o, n) => {
		if (o !== n && _isDeleted(note.value.id) !== true) {
			init(props.note);
		}
	},
);
watch(() => props.renotes?.length, recalculateRenotes);

function softMuteReasonI18nSrc(what?: string) {
	if (what === "note") return i18n.ts.userSaysSomethingReason;
	if (what === "reply") return i18n.ts.userSaysSomethingReasonReply;
	if (what === "renote") return i18n.ts.userSaysSomethingReasonRenote;
	if (what === "quote") return i18n.ts.userSaysSomethingReasonQuote;

	// I don't think here is reachable, but just in case
	return i18n.ts.userSaysSomething;
}

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

function focusBefore() {
	focusPrev(el.value);
}

function focusAfter() {
	focusNext(el.value);
}

function scrollIntoView() {
	el.value!.scrollIntoView();
}

function noteClick(e) {
	if (
		document.getSelection()?.type === "Range" ||
		props.detailedView ||
		!expandOnNoteClick
	) {
		e.stopPropagation();
	} else {
		router.push(notePage(appearNote.value));
	}
}

function setPostExpanded(val: boolean) {
	postIsExpanded.value = val;
}

defineExpose({
	focus,
	blur,
	scrollIntoView,
});
</script>

<style lang="scss" scoped>
.tkcbzcuz {
	position: relative;
	transition: box-shadow 0.1s ease;
	font-size: 1.05em;
	overflow: clip;
	contain: content;
	-webkit-tap-highlight-color: transparent;

	// これらの指定はパフォーマンス向上には有効だが、ノートの高さは一定でないため、
	// 下の方までスクロールすると上のノートの高さがここで決め打ちされたものに変化し、表示しているノートの位置が変わってしまう
	// ノートがマウントされたときに自身の高さを取得し contain-intrinsic-size を設定しなおせばほぼ解決できそうだが、
	// 今度はその処理自体がパフォーマンス低下の原因にならないか懸念される。また、被リアクションでも高さは変化するため、やはり多少のズレは生じる
	// 一度レンダリングされた要素はブラウザがよしなにサイズを覚えておいてくれるような実装になるまで待った方が良さそう(なるのか？)
	//content-visibility: auto;
	//contain-intrinsic-size: 0 128px;

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

	& > .article > .main {
		&:hover,
		&:focus-within {
			:deep(.footer .button) {
				opacity: 1;
			}
		}
	}

	> .reply-to {
		& + .note-context {
			.line::before {
				content: "";
				display: block;
				margin-block-end: -4px;
				margin-block-start: 16px;
				border-inline-start: 2px solid currentColor;
				margin-inline-start: calc((var(--avatarSize) / 2) - 1px);
				opacity: 0.25;
			}
		}
	}

	.note-context {
		position: relative;
		padding-block-start: 0;
		padding-inline-end: 32px;
		padding-block-end: 0;
		padding-inline-start: 32px;
		display: flex;
		flex-wrap: wrap;
		z-index: 1;
		&:first-child {
			margin-block-start: 20px;
		}
		> :not(.line) {
			inline-size: 0;
			flex-grow: 1;
			position: relative;
			line-height: 28px;
		}
		> .line {
			position: relative;
			z-index: 2;
			inline-size: 0;
			display: flex;
			margin-inline-end: 0;
			margin-block-start: 0;
			flex-grow: 0;
			pointer-events: none;
		}

		> div > i {
			margin-inline-start: -0.5px;
		}

		&.collapsedReply {
			.line {
				opacity: 0.25;
				&::after {
					content: "";
					position: absolute;
					border-inline-start: 2px solid currentColor;
					border-block-start: 2px solid currentColor;
					margin-inline-start: calc(var(--avatarSize) / 2 - 1px);
					inline-size: calc(var(--avatarSize) / 2 + 14px);
					border-start-start-radius: calc(var(--avatarSize) / 4);
					inset-block-start: calc(50% - 1px);
					block-size: calc(50% + 5px);
				}
			}
			.info {
				color: var(--fgTransparentWeak);
				transition: color 0.2s;
			}
			.avatar {
				inline-size: 1.2em;
				block-size: 1.2em;
				border-radius: 2em;
				overflow: hidden;
				margin-inline-end: 0.4em;
				background: var(--panelHighlight);
			}
			.username {
				font-weight: 700;
				flex-shrink: 0;
				max-inline-size: 30%;
				&::after {
					content: ": ";
				}
			}
			&:hover,
			&:focus-within {
				.info {
					color: var(--fg);
				}
			}
		}
	}

	> .article {
		position: relative;
		overflow: clip;
		padding-block-start: 20px;
		padding-inline: 32px;
		padding-block-end: 10px;
		margin-block-start: -16px;
		&.history {
			margin-block-start: -90px !important;
		}

		&:first-child,
		&:nth-child(2) {
			margin-block-start: -100px;
			padding-block-start: 104px;
		}

		@media (pointer: coarse) {
			cursor: default;
		}

		.header-container {
			display: flex;
			position: relative;
			z-index: 2;
			> .avatar {
				flex-shrink: 0;
				display: block;
				margin-block-start: 0;
				margin-inline-end: 14px;
				margin-block-end: 0;
				margin-inline-start: 0;
				inline-size: var(--avatarSize);
				block-size: var(--avatarSize);
				position: relative;
				inset-block-start: 0;
				inset-inline-start: 0;
			}
			> .header {
				inline-size: 0;
				flex-grow: 1;
			}
		}
		> .main {
			flex: 1;
			min-inline-size: 0;

			> .body {
				margin-block-start: 0.7em;
				> .renote {
					padding-block-start: 8px;
					> * {
						padding: 16px;
						border: solid 1px var(--renote);
						border-radius: 8px;
						transition: background 0.2s;
						&:hover,
						&:focus-within {
							background-color: var(--panelHighlight);
						}
					}
				}
			}
		}
	}

	> .reply {
		border-block-start: solid 0.5px var(--divider);
	}

	&.max-width_500px {
		font-size: 0.975em;
		--avatarSize: 46px;
		padding-block-start: 6px;
		> .note-context {
			padding-inline: 16px;
			margin-block-start: 8px;
			> :not(.line) {
				margin-block-start: 0px;
			}
			> .line {
				margin-inline-end: 0;
				&::before {
					margin-block-start: 8px;
				}
			}
		}
		> .article {
			padding-block-start: 18px;
			padding-inline: 16px;
			padding-block-end: 8px;
			&:first-child,
			&:nth-child(2) {
				padding-block-start: 104px;
			}
			> .main > .header-container > .avatar {
				margin-inline-end: 10px;
				// inset-block-start: calc(14px + var(--stickyTop, 0px));
			}
		}
	}

	&.max-width_300px {
		--avatarSize: 40px;
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
	inline-size: 100%;

	._blur_text {
		pointer-events: auto;
	}
	&:active ._blur_text {
		filter: blur(0px);
	}
}
</style>
