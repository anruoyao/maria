<template>
	<div
		v-if="isRenote || (renotesSliced && renotesSliced.length > 0)"
		class="renote"
	>
		<i :class="icon('ph-rocket-launch')"></i>
		<I18n v-if="renotesSliced == null" :src="i18n.ts.renotedBy" tag="span">
			<template #user>
				<MkAvatar class="avatar" :user="note.user" />
				<MkA
					v-user-preview="note.userId"
					class="name"
					:to="userPage(note.user)"
					@click.stop
				>
					<MkUserName :user="note.user" />
				</MkA>
			</template>
		</I18n>
		<I18n v-else :src="i18n.ts.renotedBy" tag="span">
			<template #user>
				<template v-for="(renote, index) in renotesSliced">
					<MkAvatar class="avatar" :user="renote.user" />
					<MkA
						v-user-preview="renote.userId"
						class="name"
						:to="userPage(renote.user)"
						@click.stop
					>
						<MkUserName :user="renote.user" />
					</MkA>
					{{
						index !== renotesSliced.length - 1
							? ", "
							: renotesSliced.length < renotes!.length
							? "..."
							: ""
					}}
				</template>
			</template>
		</I18n>
		<div class="info">
			<button
				ref="renoteTime"
				class="_button time"
				@click.stop="showRenoteMenu()"
			>
				<i
					v-if="isMyNote"
					:class="icon('ph-dots-three-outline ph-dir dropdownIcon')"
				></i>
				<MkTime
					v-if="renotesSliced && renotesSliced.length > 0"
					:time="renotesSliced[0].createdAt"
				/>
				<MkTime v-else :time="note.createdAt" />
			</button>
			<MkVisibility :note="note" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { userPage } from "@/filters/user";
import { i18n } from "@/i18n";
import { isSignedIn, me } from "@/me";
import icon from "@/scripts/icon";
import type { NoteType } from "@/types/note";
import { computed, ref } from "vue";
import MkVisibility from "@/components/MkVisibility.vue";
import * as os from "@/os";

const props = defineProps<{
	note: NoteType;
	appearNote: NoteType;
	isRenote?: boolean;
	renotes?: NoteType[];
}>();

const emit = defineEmits<{
	deleted: [];
}>();

const renoteTime = ref<HTMLElement>();

const renotesSliced = computed(() => props.renotes?.slice(0, 5));

const isMyNote = computed(
	() => isSignedIn(me) && me.id === props.note.userId && props.renotes == null,
);

function showRenoteMenu(viaKeyboard = false): void {
	if (!isMyNote.value) return;
	os.popupMenu(
		[
			{
				text: i18n.ts.unrenote,
				icon: `${icon("ph-trash")}`,
				danger: true,
				action: () => {
					os.api("notes/delete", {
						noteId: props.note.id,
					});
					emit("deleted");
				},
			},
		],
		renoteTime.value,
		{
			viaKeyboard,
		},
	);
}
</script>

<style lang="scss" scoped>
.renote {
	display: flex;
	align-items: center;
	white-space: pre;
	color: var(--renote);
	cursor: pointer;

	> i {
		margin-inline-end: 4px;
	}

	.avatar {
		inline-size: 1.2em;
		block-size: 1.2em;
		border-radius: 2em;
		overflow: hidden;
		margin-inline-end: 0.4em;
		background: var(--panelHighlight);
		transform: translateY(-4px);
	}

	> span {
		overflow: hidden;
		flex-shrink: 1;
		text-overflow: ellipsis;
		white-space: nowrap;

		> .name {
			font-weight: bold;
		}
	}

	> .info {
		margin-inline-start: auto;
		font-size: 0.9em;
		display: flex;

		> .time {
			flex-shrink: 0;
			color: inherit;
			display: inline-flex;
			align-items: center;
			> .dropdownIcon {
				margin-inline-end: 4px;
			}
		}
	}
}
</style>
