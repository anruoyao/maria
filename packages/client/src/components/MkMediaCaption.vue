<template>
	<MkModal ref="modal">
		<div class="container">
			<div class="fullwidth top-caption">
				<div class="mk-dialog">
					<header>
						<Mfm v-if="title" class="title" :text="title" />
						<span
							class="text-count"
							:class="{ over: remainingLength < 0 }"
							>{{ remainingLength }}</span
						>
						<br />
					</header>
					<textarea
						id="captioninput"
						v-model="inputValue"
						autofocus
						:placeholder="input.placeholder"
						@keydown="onInputKeydown"
					></textarea>
					<div
						v-if="
							showOkButton ||
							showCaptionButton ||
							showCancelButton
						"
						class="buttons"
					>
						<MkButton
							inline
							primary
							:disabled="remainingLength < 0"
							@click="ok"
							>{{ i18n.ts.ok }}</MkButton
						>
						<MkButton inline @click="caption">{{
							i18n.ts.caption
						}}</MkButton>
						<MkButton inline @click="cancel">{{
							i18n.ts.cancel
						}}</MkButton>
					</div>
				</div>
			</div>
			<div class="hdrwpsaf fullwidth">
				<header>{{ image.name }}</header>
				<img
					id="imgtocaption"
					:src="image.url"
					:alt="image.comment || undefined"
					:title="image.comment || undefined"
				/>
				<footer>
					<span>{{ image.type }}</span>
					<span>{{ bytes(image.size) }}</span>
					<span v-if="image.properties && image.properties.width"
						>{{ number(image.properties.width) }}px ×
						{{ number(image.properties.height) }}px</span
					>
				</footer>
			</div>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import insertTextAtCursor from "insert-text-at-cursor";
import { length } from "stringz";
import type { entities } from "firefish-js";
import * as os from "@/os";
import MkModal from "@/components/MkModal.vue";
import MkButton from "@/components/MkButton.vue";
import bytes from "@/filters/bytes";
import number from "@/filters/number";
import { i18n } from "@/i18n";
import { getInstanceInfo } from "@/instance";

const props = withDefaults(
	defineProps<{
		image: entities.DriveFile;
		input: {
			placeholder: string;
			default: string;
		};
		title?: string;
		showOkButton?: boolean;
		showCaptionButton?: boolean;
		showCancelButton?: boolean;
	}>(),
	{
		showOkButton: true,
		showCaptionButton: true,
		showCancelButton: true,
	},
);

const emit = defineEmits<{
	done: [result: { canceled: boolean; result?: string | null }];
	closed: [];
}>();

const modal = ref<InstanceType<typeof MkModal> | null>(null);

const inputValue = ref(props.input.default ? props.input.default : null);

const remainingLength = computed(() => {
	const maxCaptionLength = getInstanceInfo().maxCaptionTextLength ?? 512;
	if (typeof inputValue.value !== "string") return maxCaptionLength;
	return maxCaptionLength - length(inputValue.value);
});

function done(canceled: boolean, result?: string | null) {
	emit("done", { canceled, result });
	modal.value?.close();
}

async function ok() {
	if (!props.showOkButton) return;

	const result = inputValue.value;
	done(false, result);
}

function cancel() {
	done(true);
}

function onKeydown(evt) {
	if (evt.which === 27) {
		// ESC
		cancel();
	}
}

function onInputKeydown(evt) {
	if (evt.which === 13) {
		// Enter
		if (evt.ctrlKey) {
			evt.preventDefault();
			evt.stopPropagation();
			ok();
		}
	}
}

function caption() {
	const img = document.getElementById("imgtocaption") as HTMLImageElement;
	const ta = document.getElementById("captioninput") as HTMLTextAreaElement;
	os.api("drive/files/caption-image", {
		url: img.src,
	}).then((text) => {
		insertTextAtCursor(ta, text.slice(0, 512 - ta.value.length));
	});
}

onMounted(() => {
	document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown);
});
</script>

<style lang="scss" scoped>
.container {
	display: flex;
	inline-size: 100%;
	block-size: 100%;
	flex-direction: row;
	overflow: scroll;
	position: fixed;
	inset-inline-start: 0;
	inset-block-start: 0;
}
// TODO: use logical property (max-inline-size doesn't work)
@media (max-width: 850px) {
	.container {
		flex-direction: column;
	}
	.top-caption {
		padding-block-end: 8px;
	}
}
.fullwidth {
	inline-size: 100%;
	margin: auto;
}
.mk-dialog {
	position: relative;
	padding: 32px;
	min-inline-size: 320px;
	max-inline-size: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);
	margin: auto;

	> header {
		margin-block-start: 0;
		margin-inline-end: 0;
		margin-block-end: 8px;
		margin-inline-start: 0;
		position: relative;

		> .title {
			font-weight: bold;
			font-size: 20px;
		}

		> .text-count {
			opacity: 0.7;
			position: absolute;
			inset-inline-end: 0;
		}
	}

	> .buttons {
		margin-block-start: 16px;

		> * {
			margin-block: 0;
			margin-inline: 8px;
		}
	}

	> textarea {
		display: block;
		box-sizing: border-box;
		padding-block: 0;
		padding-inline: 24px;
		margin: 0;
		inline-size: 100%;
		font-size: 16px;
		border: none;
		border-radius: 0;
		background: transparent;
		color: var(--fg);
		font-family: inherit;
		max-inline-size: 100%;
		min-inline-size: 100%;
		min-block-size: 90px;

		&:focus-visible {
			outline: none;
		}

		&:disabled {
			opacity: 0.5;
		}
	}
}
.hdrwpsaf {
	display: flex;
	flex-direction: column;
	block-size: 100%;

	> header,
	> footer {
		align-self: center;
		display: inline-block;
		padding-block: 6px;
		padding-inline: 9px;
		font-size: 90%;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 6px;
		color: #fff;
	}

	> header {
		margin-block-end: 8px;
		opacity: 0.9;
	}

	> img {
		display: block;
		flex: 1;
		min-block-size: 0;
		object-fit: contain;
		inline-size: 100%;
		cursor: zoom-out;
		image-orientation: from-image;
	}

	> footer {
		margin-block-start: 8px;
		opacity: 0.8;

		> span + span {
			margin-inline-start: 0.5em;
			padding-inline-start: 0.5em;
			border-inline-start: solid 1px rgba(255, 255, 255, 0.5);
		}
	}
}
</style>
