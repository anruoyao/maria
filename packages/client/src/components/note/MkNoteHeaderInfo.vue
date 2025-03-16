<template>
	<!-- _prId_ and _featuredId_ is not used now -->
	<!-- TODO: remove them -->
	<!-- <div v-if="appearNote._prId_" class="info">
		<i :class="icon('ph-megaphone-simple-bold')"></i>
		{{ i18n.ts.promotion
		}}<button class="_textButton hide" @click.stop="readPromo()">
			{{ i18n.ts.hideThisNote }}
			<i :class="icon('ph-x')"></i>
		</button>
	</div>
	<div v-if="appearNote._featuredId_" class="info">
		<i :class="icon('ph-lightning')"></i>
		{{ i18n.ts.featured }}
	</div> -->
	<div v-if="pinned" class="info">
		<i :class="icon('ph-push-pin')"></i>{{ i18n.ts.pinnedNote }}
	</div>
	<div v-if="collapsedReply && appearNote.reply" class="reply-to">
		<MkAvatar class="avatar" :user="appearNote.reply.user" />
		<MkUserName class="username" :user="appearNote.reply.user"></MkUserName>
		<Mfm
			class="summary"
			:text="getNoteSummary(appearNote.reply)"
			:plain="true"
			:nowrap="true"
			:lang="appearNote.reply.lang"
			:custom-emojis="note.emojis"
		/>
	</div>
</template>

<script lang="ts" setup>
import { i18n } from "@/i18n";
import { getNoteSummary } from "@/scripts/get-note-summary";
import icon from "@/scripts/icon";
import type { NoteType } from "@/types/note";

defineProps<{
	note: NoteType;
	appearNote: NoteType;
	collapsedReply?: boolean;
	pinned?: boolean;
}>();

// function readPromo() {
// 	os.api("promo/read", {
// 		noteId: props.appearNote.id,
// 	});
// 	isDeleted.value = true;
// }
</script>

<style lang="scss" scoped>
.info {
	display: flex;
	align-items: center;
	font-size: 90%;
	white-space: pre;
	color: #f6c177;

	> i {
		margin-inline-end: 4px;
	}

	> .hide {
		margin-inline-start: auto;
		color: inherit;
	}
}

.reply-to {
	color: var(--fgTransparentWeak);
	text-overflow: ellipsis;

	.avatar {
		inline-size: 1.2em;
		block-size: 1.2em;
		border-radius: 2em;
		overflow: hidden;
		margin-inline-end: 0.4em;
		margin-block-end: 0.2em;
		background: var(--panelHighlight);
	}
	.username {
		font-weight: 700;
		flex-shrink: 0;
		max-inline-size: 30%;
		&::after {
			content: ": ";
		}
	}
	.summary {
		display: inline-block;
		max-inline-size: 60%;
		position: absolute;
	}

	&:hover,
	&:focus-within {
		color: var(--fg);
	}
}
</style>
