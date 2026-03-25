<template>
	<div v-if="translating || translation != null || hasError" class="translation-container">
		<MkLoading v-if="translating" mini/>
		<div v-else-if="hasError" class="error-container">
			<p class="error-message">
				<i :class="icon('ph-warning')"></i>
				{{ errorMessage || i18n.ts.somethingHappened }}
			</p>
			<MkButton class="retry-button" @click.stop="translate">
				{{ i18n.ts.retry }}
			</MkButton>
		</div>
		<div v-else-if="translation != null" class="translated">
			<b
				>{{
					i18n.t("translatedFrom", {
						x: translation.sourceLang,
					})
				}}:
			</b>
			<Mfm
				:text="translation.text"
				:author="note.user"
				:i="me"
				:lang="targetLang"
				:custom-emojis="note.emojis"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { i18n } from "@/i18n";
import { me } from "@/me";
import type { NoteTranslation, NoteType } from "@/types/note";
import { computed, ref, watch } from "vue";
import * as os from "@/os";
import { getInstanceInfo } from "@/instance";
import MkButton from "@/components/MkButton.vue";

const props = defineProps<{
	note: NoteType;
	detailedView?: boolean;
}>();

const translation = ref<NoteTranslation | null>(null);
const translating = ref<boolean>();
const hasError = ref<boolean>();
const errorMessage = ref<string>();
const canTranslate = computed(
	() =>
		getInstanceInfo().translatorAvailable &&
		translation.value == null &&
		translating.value !== true,
);

const lang = localStorage.getItem("lang");
const translateLang = localStorage.getItem("translateLang");
const targetLang = (translateLang || lang || navigator.language)?.slice(0, 2);

watch(
	() => props.note.id,
	(o, n) => {
		if (o !== n) {
			translating.value = false;
			translation.value = null;
		}
	},
);

async function getTranslation(noteId: string, targetLang: string) {
	return await os.api("notes/translate", {
		noteId,
		targetLang,
	});
}

async function translate() {
	try {
		if (translation.value != null) return;
		translating.value = true;
		errorMessage.value = undefined;
		translation.value = await getTranslation(
			props.note.id,
			translateLang || lang || navigator.language,
		);

		// use UI language as the second translation language
		if (
			translateLang != null &&
			lang != null &&
			translateLang !== lang &&
			(!translation.value ||
				translation.value.sourceLang.toLowerCase() ===
					translateLang.slice(0, 2))
		)
			translation.value = await getTranslation(props.note.id, lang);
		hasError.value = false;
	} catch (err: any) {
		hasError.value = true;
		translation.value = null;
		errorMessage.value = err.message || err.error?.message || i18n.ts.somethingHappened;
		console.error("Translation error:", err);
	} finally {
		translating.value = false;
	}
}

defineExpose({
	translate,
	canTranslate,
	targetLang,
});
</script>

<style lang="scss" scoped>
.translation-container {
	border: solid 0.5px var(--divider);
	border-radius: var(--radius);
	padding: 12px;
	margin-block-start: 8px;
}

.error-container {
	padding: 16px;
	text-align: center;
}

.error-message {
	margin-block-start: 0;
	margin-inline-end: 0;
	margin-block-end: 8px;
	margin-inline-start: 0;
	color: var(--error);
}

.retry-button {
	margin-block: 0;
	margin-inline: auto;
}
</style>
