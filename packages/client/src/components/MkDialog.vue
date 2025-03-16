<template>
	<MkModal
		ref="modal"
		:prefer-type="'dialog'"
		@click="done(true)"
		@closed="emit('closed')"
	>
		<div :class="$style.root">
			<div v-if="icon" :class="$style.icon">
				<i :class="icon"></i>
			</div>
			<div
				v-else-if="!input && !select"
				:class="[$style.icon, $style[`type_${type}`]]"
			>
				<i
					v-if="type === 'success'"
					:class="[$style.iconInner, iconify('ph-check')]"
				></i>
				<i
					v-else-if="type === 'error'"
					:class="[
						$style.iconInner,
						iconify('ph-circle-wavy-warning'),
					]"
				></i>
				<i
					v-else-if="type === 'warning'"
					:class="[$style.iconInner, iconify('ph-warning')]"
				></i>
				<i
					v-else-if="type === 'info'"
					:class="[$style.iconInner, iconify('ph-info')]"
				></i>
				<i
					v-else-if="type === 'question'"
					:class="[$style.iconInner, iconify('ph-question')]"
				></i>
				<MkLoading
					v-else-if="type === 'waiting'"
					:class="$style.iconInner"
					:em="true"
				/>
			</div>
			<header v-if="title" :class="$style.title">
				<Mfm :text="title" />
			</header>
			<header
				v-if="title == null && input && input.type === 'password'"
				:class="$style.title"
			>
				<Mfm :text="i18n.ts.password" />
			</header>
			<div v-if="text" :class="$style.text">
				<span
					v-if="isPlaintext === true"
					style="white-space: pre-line"
					>{{ text }}</span
				>
				<Mfm v-else :text="text" />
			</div>
			<MkInput
				v-if="input && input.type !== 'paragraph'"
				ref="inputEl"
				v-model="inputValue"
				autofocus
				:autocomplete="input.autocomplete"
				:type="input.type == 'search' ? 'search' : input.type || 'text'"
				:placeholder="input.placeholder || undefined"
				:style="{
					inlineSize: input.type === 'search' ? '300px' : null,
				}"
				@keydown="onInputKeydown"
			>
				<template v-if="input.type === 'password'" #prefix
					><i :class="iconify('ph-password')"></i
				></template>
				<template #caption>
					<span
						v-if="
							okButtonDisabled &&
							disabledReason === 'charactersExceeded'
						"
						v-text="
							i18n.t('_dialog.charactersExceeded', {
								current: (inputValue as string).length,
								max: input.maxLength ?? 'NaN',
							})
						"
					/>
					<span
						v-else-if="
							okButtonDisabled &&
							disabledReason === 'charactersBelow'
						"
						v-text="
							i18n.t('_dialog.charactersBelow', {
								current: (inputValue as string).length,
								min: input.minLength ?? 'NaN',
							})
						"
					/>
				</template>
			</MkInput>
			<MkTextarea
				v-if="input && input.type === 'paragraph'"
				v-model="(inputValue as string)"
				autofocus
				type="paragraph"
				:placeholder="input.placeholder || undefined"
			>
			</MkTextarea>
			<MkSelect v-if="select" v-model="selectedValue" autofocus>
				<template v-if="select.items">
					<option v-for="item in select.items" :value="item.value">
						{{ item.text }}
					</option>
				</template>
				<template v-else>
					<optgroup
						v-for="groupedItem in select.groupedItems"
						:label="groupedItem.label"
					>
						<option
							v-for="item in groupedItem.items"
							:value="item.value"
						>
							{{ item.text }}
						</option>
					</optgroup>
				</template>
			</MkSelect>

			<div
				v-if="(showOkButton || showCancelButton) && !actions"
				:class="$style.buttons"
			>
				<div v-if="!isYesNo">
					<MkButton
						v-if="showOkButton"
						inline
						primary
						:autofocus="!input && !select"
						:disabled="okButtonDisabled"
						@click="ok"
						>{{
							okText ??
							(showCancelButton || input || select
								? i18n.ts.ok
								: i18n.ts.gotIt)
						}}</MkButton
					>
					<MkButton
						v-if="showCancelButton || input || select"
						inline
						@click="cancel"
						>{{ cancelText ?? i18n.ts.cancel }}</MkButton
					>
				</div>
				<div v-else>
					<MkButton
						v-if="showOkButton"
						inline
						primary
						:autofocus="!input && !select"
						@click="ok"
						>{{ i18n.ts.yes }}
					</MkButton>
					<MkButton
						v-if="showCancelButton || input || select"
						inline
						@click="cancel"
						>{{ i18n.ts.no }}</MkButton
					>
				</div>
			</div>
			<div v-if="actions" :class="$style.buttons">
				<MkButton
					v-for="action in actions"
					:key="action.text"
					inline
					:primary="action.primary"
					@click="
						() => {
							action.callback();
							modal?.close(null);
						}
					"
					>{{ action.text }}</MkButton
				>
			</div>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import MkModal from "@/components/MkModal.vue";
import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/form/input.vue";
import MkTextarea from "@/components/form/textarea.vue";
import MkSelect from "@/components/form/select.vue";
import { i18n } from "@/i18n";
import iconify from "@/scripts/icon";

interface Input {
	type?:
		| "text"
		| "number"
		| "password"
		| "email"
		| "url"
		| "date"
		| "time"
		| "search"
		| "paragraph";
	placeholder?: string | null;
	autocomplete?: string;
	default?: string | number | null;
	minLength?: number;
	maxLength?: number;
}

type Select = {
	default?: string | null;
} & (
	| {
			items: {
				value: string;
				text: string;
			}[];
			groupedItems?: undefined;
	  }
	| {
			items?: undefined;
			groupedItems: {
				label: string;
				items: {
					value: string;
					text: string;
				}[];
			}[];
	  }
);

const props = withDefaults(
	defineProps<{
		type?:
			| "success"
			| "error"
			| "warning"
			| "info"
			| "question"
			| "waiting"
			| "search";
		title?: string | null;
		text?: string | null;
		isPlaintext?: boolean;
		input?: Input;
		select?: Select;
		icon?: string;
		actions?: {
			text: string;
			primary?: boolean;
			callback: () => void;
		}[];
		showOkButton?: boolean;
		showCancelButton?: boolean;
		isYesNo?: boolean;

		cancelableByBgClick?: boolean;
		okText?: string;
		cancelText?: string;
	}>(),
	{
		type: "info",
		showOkButton: true,
		showCancelButton: false,
		isYesNo: false,

		cancelableByBgClick: true,
		isPlaintext: false,
	},
);

const emit = defineEmits<{
	(
		ev: "done",
		v: { canceled: boolean; result?: string | number | boolean | null },
	): void;
	(ev: "closed"): void;
}>();

const modal = shallowRef<InstanceType<typeof MkModal>>();

const inputValue = ref<string | number | null>(props.input?.default ?? null);
const selectedValue = ref(props.select?.default ?? null);

const disabledReason = ref<null | "charactersExceeded" | "charactersBelow">(
	null,
);
const okButtonDisabled = computed<boolean>(() => {
	if (props.input) {
		if (props.input.minLength) {
			if (
				(inputValue.value || inputValue.value === "") &&
				(inputValue.value as string).length < props.input.minLength
			) {
				disabledReason.value = "charactersBelow";
				return true;
			}
		}
		if (props.input.maxLength) {
			if (
				inputValue.value &&
				(inputValue.value as string).length > props.input.maxLength
			) {
				disabledReason.value = "charactersExceeded";
				return true;
			}
		}
	}
	return false;
});

const inputEl = ref<typeof MkInput>();

function done(canceled: boolean, result?: string | number | boolean | null) {
	emit("done", { canceled, result });
	modal.value?.close(null);
}

async function ok() {
	if (!props.showOkButton) return;

	const result = props.input
		? inputValue.value
		: props.select
			? selectedValue.value
			: true;
	done(false, result);
}

function cancel() {
	done(true);
}
/*
function onBgClick() {
	if (props.cancelableByBgClick) cancel();
}
*/
function onKeydown(evt: KeyboardEvent) {
	if (evt.key === "Escape") cancel();
}

function onInputKeydown(evt: KeyboardEvent) {
	if (evt.key === "Enter") {
		evt.preventDefault();
		evt.stopPropagation();
		ok();
	}
}

// function formatDateToYYYYMMDD(date) {
// 	const year = date.getFullYear();
// 	const month = ("0" + (date.getMonth() + 1)).slice(-2);
// 	const day = ("0" + (date.getDate() + 1)).slice(-2);
// 	return `${year}-${month}-${day}`;
// }

/**
 * Appends a new search parameter to the value in the input field.
 * Trims any extra whitespace before and after, then adds a space at the end so a user can immediately
 * begin typing a new criteria.
 * @param value The value to append.
 */
// function appendFilter(value: string) {
// 	return (
// 		[
// 			typeof inputValue.value === "string"
// 				? inputValue.value.trim()
// 				: inputValue.value,
// 			value,
// 		]
// 			.join(" ")
// 			.trim() + " "
// 	);
// }

onMounted(() => {
	document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown);
});
</script>

<style lang="scss" module>
.root {
	position: relative;
	margin: auto;
	padding: 32px;
	min-inline-size: 320px;
	max-inline-size: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);
}

.icon {
	font-size: 24px;

	& + .title {
		margin-block-start: 8px;
	}
}

.iconInner {
	display: block;
	margin-block: 0;
	margin-inline: auto;
}

.type_info {
	color: var(--accent);
}

.type_success {
	color: var(--success);
}

.type_error {
	color: var(--error);
}

.type_warning {
	color: var(--warn);
}

.title {
	margin-block-start: 0;
	margin-inline-end: 0;
	margin-block-end: 8px;
	margin-inline-start: 0;
	font-weight: bold;
	font-size: 1.1em;

	& + .text {
		margin-block-start: 8px;
	}
}

.text {
	margin-block-start: 16px;
	margin-inline-end: 0;
	margin-block-end: 0;
	margin-inline-start: 0;
}

.buttons {
	margin-block-start: 16px;
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
}
</style>
