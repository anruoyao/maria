<template>
	<button
		v-if="canRenote && defaultStore.state.seperateRenoteQuote"
		ref="el"
		v-tooltip.noDelay.bottom="i18n.ts.quote"
		class="eddddedb _button"
		@click.stop="quote()"
	>
		<i :class="icon('ph-quotes')"></i>
	</button>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { acct, type entities } from "firefish-js";
import { pleaseLogin } from "@/scripts/please-login";
import * as os from "@/os";
import { me } from "@/me";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const props = defineProps<{
	note: entities.Note;
}>();

const el = ref<HTMLButtonElement>();

const canRenote = computed(
	() =>
		["public", "home"].includes(props.note.visibility) ||
		props.note.userId === me?.id,
);

function quote(): void {
	pleaseLogin();
	if (
		props.note.renote != null &&
		(props.note.text != null ||
			props.note.fileIds.length === 0 ||
			props.note.poll != null)
	) {
		menu();
	} else {
		normalQuote();
	}
}

function normalQuote(): void {
	os.post({
		renote: props.note,
	});
}

function slashQuote(): void {
	os.post({
		initialText: ` // @${acct.toString(props.note.user)}: ${props.note.text}`,
		selectRange: [0, 0],
		renote: props.note.renote,
		channel: props.note.channel,
	});
}

function menu(viaKeyboard = false): void {
	os.popupMenu(
		[
			{
				text: i18n.ts.quote,
				icon: `${icon("ph-quotes")}`,
				action: normalQuote,
			},
			{
				text: i18n.ts.slashQuote,
				icon: `${icon("ph-notches")}`,
				action: slashQuote,
			},
		],
		el.value,
		{
			viaKeyboard,
		},
	).then(focus);
}

function focus(): void {
	el.value!.focus();
}
</script>

<style lang="scss" scoped>
.eddddedb {
	display: inline-block;
	block-size: 32px;
	margin: 2px;
	padding-block: 0;
	padding-inline: 6px;
	border-radius: 4px;

	&.renoted {
		background: var(--accent);
	}

	> .count {
		display: inline;
		margin-inline-start: 8px;
		opacity: 0.7;
	}
}
</style>
