<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :display-back-button="true"
		/></template>
		<MkSpacer :content-max="800">
			<MkLoading v-if="note == null" />
			<div v-else>
				<MkRemoteCaution
					v-if="note.user.host != null"
					:href="note.url ?? note.uri!"
				/>
				<MkPagination
					ref="pagingComponent"
					v-slot="{ items }"
					:pagination="pagination"
				>
					<div ref="tlEl" class="giivymft noGap">
						<XList
							v-slot="{ item }"
							:items="convertNoteEditsToNotes(items)"
							class="notes"
							:no-gap="true"
						>
							<XNote
								:key="item.id"
								class="qtqtichx"
								:note="item"
								:hide-footer="true"
								:detailed-view="true"
							/>
						</XList>
					</div>
				</MkPagination>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import type { entities } from "firefish-js";
import MkPagination, {
	type MkPaginationType,
} from "@/components/MkPagination.vue";
import { api } from "@/os";
import XList from "@/components/MkDateSeparatedList.vue";
import XNote from "@/components/MkNote.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";
import MkRemoteCaution from "@/components/MkRemoteCaution.vue";

const pagingComponent = ref<MkPaginationType<
	typeof pagination.endpoint
> | null>(null);

const props = defineProps<{
	noteId: string;
}>();

const pagination = {
	endpoint: "notes/history" as const,
	limit: 10,
	offsetMode: true,
	params: computed(() => ({
		noteId: props.noteId,
	})),
};

definePageMetadata(
	computed(() => ({
		title: i18n.ts.noteEditHistory,
		icon: `${icon("ph-clock-countdown")}`,
	})),
);

const note = ref<entities.Note | null>(null);

onMounted(() => {
	api("notes/show", {
		noteId: props.noteId,
	}).then((res) => {
		// Remove unnecessary parts
		res.renote = undefined;
		res.renoteId = null;
		res.reply = undefined;
		res.replyId = null;

		note.value = res;
	});
});

function convertNoteEditsToNotes(noteEdits: entities.NoteEdit[]) {
	const now: entities.NoteEdit = {
		id: "EditionNow",
		noteId: note.value!.id,
		updatedAt: note.value!.createdAt,
		text: note.value!.text,
		cw: note.value!.cw,
		files: note.value!.files,
		fileIds: note.value!.fileIds,
		emojis: note.value!.emojis,
	};

	return [now]
		.concat(noteEdits)
		.map((noteEdit: entities.NoteEdit, index, arr): entities.Note => {
			return Object.assign({}, note.value, {
				historyId: noteEdit.id,
				// Conversion from updatedAt to createdAt
				// The createdAt of a edition's content is actually the updatedAt of the previous one.
				createdAt: arr[(index + 1) % arr.length].updatedAt,
				text: noteEdit.text,
				cw: noteEdit.cw,
				_shouldInsertAd_: false,
				files: noteEdit.files,
				fileIds: noteEdit.fileIds,
				emojis: note.value!.emojis.concat(noteEdit.emojis),
			});
		});
}
</script>

<style lang="scss" scoped>
.giivymft {
	&.noGap {
		> .notes {
			background: var(--panel) !important;
			border-radius: var(--radius);
		}
	}
	&:not(.noGap) {
		> .notes {
			.qtqtichx {
				background: var(--panel);
				border-radius: var(--radius);
			}
		}
	}
}
</style>
