<template>
	<MkModal
		ref="modal"
		:prefer-type="'dialog'"
		@click="modal!.close()"
		@closed="onModalClosed()"
	>
		<MkPostForm
			ref="form"
			style="margin: 0 auto auto auto"
			v-bind="props"
			autofocus
			freeze-after-posted
			@posted="onPosted"
			@cancel="modal!.close()"
			@esc="modal!.close()"
		/>
	</MkModal>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";

import type { entities, languages } from "firefish-js";
import MkModal from "@/components/MkModal.vue";
import MkPostForm from "@/components/MkPostForm.vue";
import type { NoteVisibility } from "@/types/note";
import type { NoteDraft } from "@/types/post-form";

const props = defineProps<{
	reply?: entities.Note;
	renote?: entities.Note;
	channel?: entities.Channel;
	mention?: entities.User;
	specified?: entities.User;
	initialText?: string;
	initialVisibility?: NoteVisibility;
	initialLanguage?: (typeof languages)[number];
	initialFiles?: entities.DriveFile[];
	initialLocalOnly?: boolean;
	initialVisibleUsers?: entities.User[];
	initialNote?: NoteDraft;
	instant?: boolean;
	fixed?: boolean;
	autofocus?: boolean;
	editId?: entities.Note["id"];
	selectRange?: [
		start: number,
		end: number,
		direction?: "forward" | "backward" | "none",
	];
}>();

const emit = defineEmits<(ev: "closed") => void>();

const modal = shallowRef<InstanceType<typeof MkModal>>();
const form = shallowRef<InstanceType<typeof MkPostForm>>();

function onPosted() {
	modal.value!.close({
		useSendAnimation: true,
	});
}

function onModalClosed() {
	emit("closed");
}
</script>
