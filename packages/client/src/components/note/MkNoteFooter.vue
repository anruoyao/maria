<template>
	<footer class="footer" ref="el" tabindex="-1">
		<XReactionsViewer
			v-if="enableEmojiReactions && !hideEmojiViewer"
			ref="reactionsViewer"
			:note="note"
		/>
		<button
			v-tooltip.noDelay.bottom="i18n.ts.reply"
			class="button _button"
			@click.stop="reply()"
			:disabled="note.scheduledAt != null"
		>
			<i :class="icon('ph-arrow-u-up-left')"></i>
			<template v-if="note.repliesCount > 0 && !detailedView">
				<p class="count">{{ note.repliesCount }}</p>
			</template>
		</button>
		<XRenoteButton
			ref="renoteButton"
			class="button"
			:note="note"
			:count="note.renoteCount"
			:detailed-view="detailedView"
		/>
		<XStarButtonNoEmoji
			v-if="!enableEmojiReactions"
			class="button"
			:note="note"
			:count="reactionCount"
			:reacted="note.myReaction != null"
			:disabled="note.scheduledAt != null"
		/>
		<XStarButton
			v-if="enableEmojiReactions && note.myReaction == null"
			ref="starButton"
			class="button"
			:note="note"
			:disabled="note.scheduledAt != null"
		/>
		<button
			v-if="enableEmojiReactions && note.myReaction == null"
			ref="reactButton"
			v-tooltip.noDelay.bottom="i18n.ts.reaction"
			class="button _button"
			@click.stop="react()"
			:disabled="note.scheduledAt != null"
		>
			<i :class="icon('ph-smiley')"></i>
			<p v-if="reactionCount > 0 && hideEmojiViewer" class="count">
				{{ reactionCount }}
			</p>
		</button>
		<button
			v-if="enableEmojiReactions && note.myReaction != null"
			ref="reactButton"
			v-tooltip.noDelay.bottom="i18n.ts.removeReaction"
			class="button _button reacted"
			@click.stop="undoReact(note)"
			:disabled="note.scheduledAt != null"
		>
			<i :class="icon('ph-minus')"></i>
			<p v-if="reactionCount > 0 && hideEmojiViewer" class="count">
				{{ reactionCount }}
			</p>
		</button>
		<XQuoteButton
			class="button"
			:note="note"
			:disabled="note.scheduledAt != null"
		/>
		<button
			v-if="
				isSignedIn(me) &&
				isForeignLanguage &&
				noteTranslation?.canTranslate
			"
			v-tooltip.noDelay.bottom="i18n.ts.translate"
			class="button _button"
			@click.stop="noteTranslation?.translate"
		>
			<i :class="icon('ph-translate')"></i>
		</button>
		<button
			ref="menuButton"
			v-tooltip.noDelay.bottom="i18n.ts.more"
			class="button _button"
			@click.stop="menu()"
		>
			<i :class="icon('ph-dots-three-outline ph-dir')"></i>
		</button>
	</footer>
</template>

<script lang="ts" setup>
import { i18n } from "@/i18n";
import { isSignedIn, me } from "@/me";
import icon from "@/scripts/icon";
import type { NoteType } from "@/types/note";
import { type Ref, computed, inject, ref, watch } from "vue";
import XReactionsViewer from "@/components/MkReactionsViewer.vue";
import XStarButton from "@/components/MkStarButton.vue";
import XStarButtonNoEmoji from "@/components/MkStarButtonNoEmoji.vue";
import XQuoteButton from "@/components/MkQuoteButton.vue";
import XRenoteButton from "@/components/MkRenoteButton.vue";
import * as os from "@/os";
import { pleaseLogin } from "@/scripts/please-login";
import { reactionPicker } from "@/scripts/reaction-picker";
import { getNoteMenu } from "@/scripts/get-note-menu";
import { defaultStore } from "@/store";
import { detectLanguage } from "@/scripts/language-utils";
import type { entities } from "firefish-js";
import type MkNoteTranslation from "./MkNoteTranslation.vue";

const props = defineProps<{
	note: NoteType;
	enableEmojiReactions?: boolean;
	hideEmojiViewer?: boolean;
	detailedView?: boolean;
	noteTranslation: InstanceType<typeof MkNoteTranslation> | null;
}>();

const emit = defineEmits<{
	"event:focus": [];
	"event:blur": [];
	deleted: [];
}>();

const el = ref<HTMLElement | null>(null);
const starButton = ref<InstanceType<typeof XStarButton>>();
const renoteButton = ref<InstanceType<typeof XRenoteButton> | null>(null);
const reactButton = ref<HTMLElement | null>(null);
const menuButton = ref<HTMLElement>();

const reactionCount = computed(() =>
	Object.values(props.note.reactions).reduce(
		(partialSum, val) => partialSum + val,
		0,
	),
);

const currentClipPage = inject<Ref<entities.Clip> | null>(
	"currentClipPage",
	null,
);

const isForeignLanguage = computed(
	() =>
		defaultStore.state.detectPostLanguage &&
		props.note.text != null &&
		(() => {
			const postLang = detectLanguage(props.note.text);
			return postLang !== "" && postLang !== props.noteTranslation?.targetLang;
		})(),
);

function focus() {
	emit("event:focus");
}

function reply(_viaKeyboard = false): void {
	pleaseLogin();
	os.post(
		{
			reply: props.note,
			// animation: !viaKeyboard,
		},
		() => {
			focus();
		},
	);
}

function react(_viaKeyboard = false): void {
	pleaseLogin();
	emit("event:blur");
	reactionPicker.show(
		reactButton.value!,
		(reaction) => {
			os.api("notes/reactions/create", {
				noteId: props.note.id,
				reaction,
			});
		},
		() => {
			focus();
		},
	);
}

function undoReact(note: NoteType): void {
	const oldReaction = note.myReaction;
	if (!oldReaction) return;
	os.api("notes/reactions/delete", {
		noteId: note.id,
	});
}

function menu(viaKeyboard = false): void {
	const isDeleted = ref(false);
	watch(isDeleted, (v) => {
		if (v === true) emit("deleted");
	});
	os.popupMenu(
		getNoteMenu({
			note: props.note,
			menuButton,
			isDeleted,
			currentClipPage,
			translationEl: props.noteTranslation,
		}),
		menuButton.value,
		{
			viaKeyboard,
		},
	).then(focus);
}

defineExpose({
	reply,
	react,
	undoReact,
	menu,
	renote: (viaKeyboard: boolean) => renoteButton.value!.renote(viaKeyboard),
	focus: () => el.value?.focus(),
});
</script>

<style lang="scss" scoped>
.footer {
	position: relative;
	z-index: 2;
	display: flex;
	flex-wrap: wrap;
	margin-block-start: 0.4em;
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
			display: inline-block !important;
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
</style>
