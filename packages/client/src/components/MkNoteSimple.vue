<template>
	<div
		v-show="!deleted"
		ref="el"
		v-size="{ min: [350, 500] }"
		class="yohlumlk"
	>
		<MkAvatar class="avatar" :user="note.user" />
		<div class="main">
			<XNoteHeader class="header" :note="note" :mini="true" />
			<div class="body">
				<XNoteContent class="text" :note="note" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";
import { computed, ref, watch } from "vue";
import XNoteHeader from "@/components/note/MkNoteHeader.vue";
import XNoteContent from "@/components/note/MkNoteContent.vue";
import { deepClone } from "@/scripts/clone";
import { useNoteCapture } from "@/scripts/use-note-capture";
import { isDeleted } from "@/scripts/note";

const props = defineProps<{
	note: entities.Note;
	pinned?: boolean;
}>();

const rootEl = ref<HTMLElement | null>(null);
const note = ref(deepClone(props.note));
const deleted = computed(() => isDeleted(note.value.id));
let capture = useNoteCapture({
	note,
	rootEl,
});

function reload() {
	note.value = deepClone(props.note);
	capture.close();
	capture = useNoteCapture({
		note,
		rootEl,
	});
}

watch(
	() => props.note.id,
	(o, n) => {
		if (o === n) return;
		reload();
	},
);
</script>

<style lang="scss" scoped>
.yohlumlk {
	display: flex;
	margin: 0;
	padding: 0;
	overflow: clip;
	font-size: 0.95em;

	&.min-width_350px {
		> .avatar {
			margin-block-start: 0;
			margin-inline-end: 10px;
			margin-block-end: 0;
			margin-inline-start: 0;
			inline-size: 44px;
			block-size: 44px;
		}
	}

	&.min-width_500px {
		> .avatar {
			margin-block-start: 0;
			margin-inline-end: 12px;
			margin-block-end: 0;
			margin-inline-start: 0;
			inline-size: 48px;
			block-size: 48px;
		}
	}

	> .avatar {
		flex-shrink: 0;
		display: block;
		margin-block-start: 0;
		margin-inline-end: 10px;
		margin-block-end: 0;
		margin-inline-start: 0;
		inline-size: 40px;
		block-size: 40px;
		border-radius: 8px;
	}

	> .main {
		flex: 1;
		min-inline-size: 0;

		> .header {
			margin-block-end: 2px;
		}
	}
}
</style>
