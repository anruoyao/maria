<template>
	<MkPagination
		ref="pagingComponent"
		:pagination="pagination"
		:disable-auto-load="disableAutoLoad"
		:folder
	>
		<template #empty>
			<div class="_fullinfo">
				<img
					src="/static-assets/badges/info.webp"
					class="_ghost"
					alt="Info"
				/>
				<div>{{ i18n.ts.noNotes }}</div>
			</div>
		</template>

		<template #default="{ foldedItems: notes }">
			<div ref="tlEl" class="giivymft" :class="{ noGap }">
				<XList
					ref="notes"
					v-slot="{ item: note }"
					:items="notes"
					:direction="pagination.reversed ? 'up' : 'down'"
					:reversed="pagination.reversed"
					:no-gap="noGap"
					:ad="true"
					class="notes"
				>
					<XNote
						v-if="'folded' in note && note.folded === 'thread'"
						:key="note.id"
						class="qtqtichx"
						:note="note.note"
						:parents="note.parents"
					/>
					<XNote
						v-else-if="'folded' in note && note.folded === 'renote'"
						:key="note.key"
						class="qtqtichx"
						:note="note.note"
						:renotes="note.renotesArr"
					/>
					<XNote
						v-else
						:key="note._featuredId_ || note._prId_ || note.id"
						class="qtqtichx"
						:note="note"
					/>
				</XList>
			</div>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { entities } from "firefish-js";
import type {
	MkPaginationType,
	PagingKeyOf,
	PagingOf,
} from "@/components/MkPagination.vue";
import XNote from "@/components/MkNote.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import MkPagination from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";
import { scroll } from "@/scripts/scroll";
import type { NoteFolded, NoteThread, NoteType } from "@/types/note";

const tlEl = ref<HTMLElement>();

withDefaults(
	defineProps<{
		pagination: PagingOf<entities.Note>;
		noGap?: boolean;
		disableAutoLoad?: boolean;
		folder?: (ns: entities.Note[]) => (NoteType | NoteThread | NoteFolded)[];
	}>(),
	{
		folder: (ns: entities.Note[]) => ns,
	},
);

const pagingComponent = ref<MkPaginationType<
	PagingKeyOf<entities.Note>
> | null>(null);

function scrollTop() {
	if (tlEl.value) {
		scroll(tlEl.value, { top: 0, behavior: "smooth" });
	}
}

defineExpose({
	pagingComponent,
	scrollTop,
});
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
