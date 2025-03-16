<template>
	<template v-for="file in note.files">
    <XNoteMedia
        v-if="
							file.type.startsWith('video') ||
							file.type.startsWith('image')
						"
        :key="file.id"
        :class="{ image: file.type.startsWith('image') }"
        :data-id="file.id"
        :media="file"
        :note="note"
    />
	</template>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";
import XNoteMedia from "@/components/note/MkNoteMedia.vue";

defineProps<{
	note: entities.Note;
}>();
</script>
