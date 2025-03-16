<template>
	<p v-if="note.cw != null" class="cw">
		<MkA
			v-if="conversation && note.renoteId == parentId && parentId != null"
			:to="
				detailedView ? `#${parentId}` : `${notePage(note)}#${parentId}`
			"
			behavior="browser"
			class="reply-icon"
			@click.stop
		>
			<i :class="icon('ph-quotes')"></i>
		</MkA>
		<MkA
			v-else-if="!detailed && note.replyId"
			v-tooltip="i18n.ts.jumpToPrevious"
			:to="
				detailedView
					? `#${note.replyId}`
					: `${notePage(note)}#${note.replyId}`
			"
			behavior="browser"
			class="reply-icon"
			@click.stop
		>
			<i :class="icon('ph-arrow-bend-left-up')"></i>
		</MkA>
		<Mfm
			v-if="note.cw != ''"
			class="text"
			:text="note.cw"
			:author="note.user"
			:lang="note.lang"
			:custom-emojis="note.emojis"
		/>
	</p>
	<div class="wrmlmaau">
		<div
			class="content"
			:class="{
				collapsed,
				isLong,
				manyImages: note.files.length > 4,
				showContent: note.cw && !showContent,
				animatedMfm: !disableMfm,
			}"
		>
			<XShowMoreButton
				v-if="isLong && collapsed"
				ref="showMoreButton"
				v-model="collapsed"
				@keydown="focusFooter"
			></XShowMoreButton>
			<XCwButton
				v-if="note.cw && !showContent"
				ref="cwButton"
				v-model="showContent"
				:note="note"
				@keydown="focusFooter"
				@update:model-value="(val) => emit('expanded', val)"
			/>
			<div
				class="body"
				v-bind="{
					'aria-hidden': note.cw && !showContent ? 'true' : undefined,
					tabindex: !showContent ? '-1' : undefined,
				}"
			>
				<span v-if="deleted" style="opacity: 0.5"
					>({{ i18n.ts.deleted }})</span
				>
				<template v-if="!note.cw">
					<MkA
						v-if="conversation && note.renoteId == parentId"
						:to="
							detailedView
								? `#${parentId}`
								: `${notePage(note)}#${parentId}`
						"
						behavior="browser"
						class="reply-icon"
						@click.stop
					>
						<i :class="icon('ph-quotes')"></i>
					</MkA>
					<MkA
						v-else-if="!detailed && note.replyId"
						v-tooltip="i18n.ts.jumpToPrevious"
						:to="
							detailedView
								? `#${note.replyId}`
								: `${notePage(note)}#${note.replyId}`
						"
						behavior="browser"
						class="reply-icon"
						@click.stop
					>
						<i :class="icon('ph-arrow-bend-left-up')"></i>
					</MkA>
				</template>
				<Mfm
					v-if="note.text"
					:text="note.text"
					:author="note.user"
					:lang="note.lang"
					:custom-emojis="note.emojis"
				/>
				<MkA
					v-if="!detailed && note.renoteId"
					class="rp"
					:to="`/notes/${note.renoteId}`"
					>{{ i18n.ts.quoteAttached }}: ...</MkA
				>
				<XMediaList
					v-if="note.files.length > 0"
					:media-list="note.files"
				/>
				<XPoll v-if="note.poll" :note="note" class="poll" />
				<template v-if="detailed">
					<MkUrlPreview
						v-for="url in urls"
						:key="url"
						:url="url"
						:compact="true"
						:detail="false"
						class="url-preview"
					/>
					<div
						v-if="note.renote"
						class="renote"
						@click.stop="emit('push', note.renote)"
					>
						<XNoteSimple :note="note.renote" />
					</div>
				</template>
				<div
					v-if="
						(note.cw && !showContent) ||
						(showMoreButton && collapsed)
					"
					tabindex="0"
					@focus="
						cwButton?.focus();
						showMoreButton?.focus();
					"
				></div>
			</div>
			<XShowMoreButton
				v-if="isLong && !collapsed"
				v-model="collapsed"
			></XShowMoreButton>
			<XCwButton
				v-if="note.cw && showContent"
				v-model="showContent"
				:note="note"
			/>
		</div>
		<MkButton
			v-if="hasMfm && defaultStore.state.animatedMfm"
			mini
			rounded
			@click.stop="toggleMfm"
		>
			<template v-if="disableMfm">
				<i :class="icon('ph-play', false)"></i>
				{{ i18n.ts._mfm.play }}
			</template>
			<template v-else>
				<i :class="icon('ph-stop', false)"></i>
				{{ i18n.ts._mfm.stop }}
			</template>
		</MkButton>
		<!-- <div
			v-if="(isLong && !collapsed) || (props.note.cw && showContent)"
			class="fade"
		></div> -->
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { entities } from "firefish-js";
import * as mfm from "mfm-js";
import * as os from "@/os";
import XNoteSimple from "@/components/MkNoteSimple.vue";
import XMediaList from "@/components/MkMediaList.vue";
import XPoll from "@/components/MkPoll.vue";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import XShowMoreButton from "@/components/MkShowMoreButton.vue";
import XCwButton from "@/components/MkCwButton.vue";
import MkButton from "@/components/MkButton.vue";
import { notePage } from "@/filters/note";
import { extractUrlFromMfm } from "@/scripts/extract-url-from-mfm";
import { extractMfmWithAnimation } from "@/scripts/extract-mfm";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";
import { isDeleted } from "@/scripts/note";

const props = withDefaults(
	defineProps<{
		note: entities.Note;
		parentId?: string;
		conversation?: entities.Note[];
		detailed?: boolean;
		detailedView?: boolean;
		isLongJudger?: (note: entities.Note) => boolean;
	}>(),
	{
		isLongJudger: (note: entities.Note) => {
			return (
				note.text != null &&
				(note.text.split("\n").length > 10 ||
					note.text.length > 800 ||
					note.files.length > 4)
			);
		},
	},
);

const emit = defineEmits<{
	(ev: "push", v): void;
	(ev: "focusfooter"): void;
	(ev: "expanded", v): void;
}>();

const cwButton = ref<HTMLElement>();
const showMoreButton = ref<HTMLElement>();

const isLong = computed(
	() =>
		!props.detailedView &&
		props.note.cw == null &&
		props.isLongJudger(props.note),
);
const urls = computed(() =>
	props.note.text
		? extractUrlFromMfm(mfm.parse(props.note.text)).slice(0, 5)
		: null,
);
const mfms = computed(() =>
	props.note.text ? extractMfmWithAnimation(mfm.parse(props.note.text)) : null,
);
const hasMfm = computed(() => mfms.value && mfms.value.length > 0);

const deleted = computed(() => isDeleted(props.note.id));

const disableMfm = ref(defaultStore.state.animatedMfm);
const showContent = ref(false);
const collapsed = ref(props.note.cw == null && isLong.value);

watch(
	() => props.note.id,
	(o, n) => {
		if (o !== n) return;
		disableMfm.value = defaultStore.state.animatedMfm;
		showContent.value = false;
		collapsed.value = props.note.cw == null && isLong.value;
	},
);

async function toggleMfm() {
	if (disableMfm.value) {
		if (!defaultStore.state.animatedMfmWarnShown) {
			const { canceled } = await os.confirm({
				type: "warning",
				text: i18n.ts._mfm.warn,
			});
			if (canceled) return;

			defaultStore.set("animatedMfmWarnShown", true);
		}

		disableMfm.value = false;
	} else {
		disableMfm.value = true;
	}
}

function focusFooter(ev) {
	if (ev.key === "Tab" && !ev.getModifierState("Shift")) {
		emit("focusfooter");
	}
}
</script>

<style lang="scss" scoped>
:deep(a),
:deep(button) {
	position: relative;
	z-index: 2;
}
.reply-icon {
	display: inline-block;
	border-radius: 6px;
	padding-block: 0.2em;
	padding-inline: 0.2em;
	margin-inline-end: 0.2em;
	color: var(--accent);
	transition: background 0.2s;
	&:hover,
	&:focus {
		background: var(--buttonHoverBg);
	}
}
.cw {
	cursor: default;
	display: block;
	margin: 0;
	padding: 0;
	margin-block-end: 10px;
	overflow-wrap: break-word;
	> .text {
		margin-inline-end: 8px;
	}
}

.wrmlmaau {
	.content {
		overflow-wrap: break-word;
		> .body {
			transition: filter 0.1s;
			> .rp {
				margin-inline-start: 4px;
				font-style: oblique;
				color: var(--renote);
			}
			.reply-icon {
				display: inline-block;
				border-radius: 6px;
				padding-block: 0.2em;
				padding-inline: 0.2em;
				margin-inline-end: 0.2em;
				color: var(--accent);
				transition: background 0.2s;
				&:hover,
				&:focus {
					background: var(--buttonHoverBg);
				}
			}
			> :deep(.files) {
				margin-block-start: 0.4em;
				margin-block-end: 0.4em;
			}
			> .url-preview {
				margin-block-start: 8px;
			}

			> .poll {
				font-size: 80%;
			}

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

		&.collapsed,
		&.showContent {
			position: relative;
			max-block-size: calc(15em + 100px);
			> .body {
				max-block-size: inherit;
				mask: linear-gradient(black calc(100% - 64px), transparent);
				-webkit-mask: linear-gradient(
					black calc(100% - 64px),
					transparent
				);
				padding-inline: 100px;
				margin-inline: -100px;
				margin-block-start: -100px;
				padding-block-start: 100px;
				overflow: hidden;
				user-select: none;
				-webkit-user-select: none;
				-moz-user-select: none;
			}
		}
		&.collapsed {
			&.manyImages {
				max-block-size: calc(15em + 250px);
			}
			> .body {
				box-sizing: border-box;
			}
		}
		&.showContent {
			> .body {
				min-block-size: 2em;
				max-block-size: 5em;
				filter: blur(5px);
				:deep(span) {
					animation: none !important;
					transform: none !important;
				}
				:deep(img) {
					filter: blur(12px);
				}
			}
			:deep(.fade) {
				inset: 0;
				inset-block-start: 90px;
			}
		}

		&:not(.animatedMfm) :deep(span) {
			animation: none !important;
		}
	}
	> :deep(button) {
		margin-block-start: 10px;
		margin-inline-start: 0;
		margin-inline-end: 0.4rem;
	}
	> .fade {
		position: absolute;
		inset: 0;
		inset-block-end: -400px;
		display: flex;
		align-items: flex-end;
		z-index: 4;
		pointer-events: none;
		&::before {
			content: "";
			display: block;
			block-size: 100px;
			position: sticky;
			inset-block-end: 0;
			inline-size: 100%;
			background: var(--panel);
			mask: linear-gradient(var(--gradient-to-block-start) var(--gradient)),;
			-webkit-mask: linear-gradient(var(--gradient-to-block-start) var(--gradient)),;
			transition: background 0.2s;
		}
	}
}
</style>
