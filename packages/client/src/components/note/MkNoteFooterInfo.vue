<template>
	<div v-if="detailedView || (note.channel && !inChannel)" class="footer-info">
		<MkA v-if="detailedView" class="created-at" :to="notePage(note)">
			<MkTime
				v-if="note.scheduledAt != null"
				:time="note.scheduledAt"
			/>
			<MkTime v-else :time="note.createdAt" mode="absolute" />
		</MkA>
		<MkA
			v-if="note.channel && !inChannel"
			class="channel"
			:to="`/channels/${note.channel.id}`"
			@click.stop
			><i :class="icon('ph-television', false)"></i>
			{{ note.channel.name }}</MkA
		>
	</div>
</template>

<script lang="ts" setup>
import { notePage } from "@/filters/note";
import icon from "@/scripts/icon";
import type { NoteType } from "@/types/note";
import { inject } from "vue";

defineProps<{
	note: NoteType;
	detailedView?: boolean;
}>();
const inChannel = inject("inChannel", null);
</script>

<style lang="scss" scoped>
.footer-info {
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 0.7em;
	margin-block-start: 16px;
	opacity: 0.7;
	font-size: 0.9em;
}
</style>
