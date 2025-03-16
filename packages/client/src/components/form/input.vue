<template>
	<div class="matxzzsk">
		<label>
			<div class="label"><slot name="label"></slot></div>
			<div class="input" :class="{ inline, disabled, focused }">
				<div ref="prefixEl" class="prefix">
					<slot name="prefix"></slot>
				</div>
				<input
					ref="inputEl"
					v-model="v"
					v-adaptive-border
					:type="type"
					:disabled="disabled"
					:required="required"
					:readonly="readonly"
					:placeholder="placeholder"
					:pattern="pattern"
					:autocomplete="autocomplete"
					:spellcheck="spellcheck"
					:step="step"
					:list="id"
					@focus="focused = true"
					@blur="focused = false"
					@keydown="onKeydown($event)"
					@input="onInput"
				/>
				<datalist v-if="datalist" :id="id">
					<option v-for="data in datalist" :key="data" :value="data" />
				</datalist>
				<div ref="suffixEl" class="suffix">
					<slot name="suffix"></slot>
				</div>
			</div>
			<div class="caption"><slot name="caption"></slot></div>
		</label>

		<MkButton
			v-if="manualSave && changed"
			primary
			class="save"
			@click="updated"
			><i :class="icon('ph-check')"></i> {{ i18n.ts.save }}</MkButton
		>
	</div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, toRefs, watch } from "vue";
import { debounce as Debounce } from "throttle-debounce";
import MkButton from "@/components/MkButton.vue";
import { useInterval } from "@/scripts/use-interval";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const props = defineProps<{
	modelValue: string | number | null;
	type?:
		| "text"
		| "number"
		| "password"
		| "email"
		| "url"
		| "date"
		| "time"
		| "search";
	required?: boolean;
	readonly?: boolean;
	disabled?: boolean;
	pattern?: string;
	placeholder?: string;
	autofocus?: boolean;
	autocomplete?: string;
	spellcheck?: boolean;
	step?: number | string;
	datalist?: string[];
	inline?: boolean;
	debounce?: boolean;
	manualSave?: boolean;
	small?: boolean;
	large?: boolean;
}>();

const emit = defineEmits<{
	(ev: "change", _ev: Event): void;
	(ev: "keydown", _ev: KeyboardEvent): void;
	(ev: "enter"): void;
	(ev: "update:modelValue", value: string | number | null): void;
}>();

const { modelValue, type, autofocus } = toRefs(props);
const v = ref(modelValue.value);
const id = Math.random().toString(); // TODO: uuid?
const focused = ref(false);
const changed = ref(false);
const invalid = ref(false);
const inputEl = ref<HTMLInputElement>();
const prefixEl = ref<HTMLElement>();
const suffixEl = ref<HTMLElement>();
const height = props.small ? 36 : props.large ? 40 : 38;

const focus = () => inputEl.value!.focus();
const selectRange = (start, end) =>
	inputEl.value!.setSelectionRange(start, end);
const onInput = (ev: Event) => {
	changed.value = true;
	emit("change", ev);
};
const onKeydown = (ev: KeyboardEvent) => {
	emit("keydown", ev);

	if (ev.code === "Enter") {
		emit("enter");
	}
};

const updated = () => {
	changed.value = false;
	if (type.value === "number") {
		emit("update:modelValue", Number.parseFloat(v.value as string));
	} else {
		emit("update:modelValue", v.value);
	}
};

const debouncedUpdated = Debounce(1000, updated);

watch(modelValue, (newValue) => {
	v.value = newValue;
});

watch(v, (_) => {
	if (!props.manualSave) {
		if (props.debounce) {
			debouncedUpdated();
		} else {
			updated();
		}
	}

	invalid.value = inputEl.value!.validity.badInput;
});

// このコンポーネントが作成された時、非表示状態である場合がある
// 非表示状態だと要素の幅などは0になってしまうので、定期的に計算する
useInterval(
	() => {
		if (prefixEl.value) {
			if (prefixEl.value.offsetWidth) {
				inputEl.value!.style.paddingInlineStart = `${prefixEl.value.offsetWidth}px`;
			}
		}
		if (suffixEl.value) {
			if (suffixEl.value.offsetWidth) {
				inputEl.value!.style.paddingInlineEnd = `${suffixEl.value.offsetWidth}px`;
			}
		}
	},
	100,
	{
		immediate: true,
		afterMounted: true,
	},
);

onMounted(() => {
	nextTick(() => {
		if (autofocus.value) {
			focus();
		}
	});
});

defineExpose({
	focus,
	selectRange,
});
</script>

<style lang="scss" scoped>
.matxzzsk {
	> label {
		> .label {
			font-size: 0.85em;
			padding-block-start: 0;
			padding-inline-end: 0;
			padding-block-end: 8px;
			padding-inline-start: 0;
			user-select: none;

			&:empty {
				display: none;
			}
		}

		> .caption {
			font-size: 0.85em;
			padding-block-start: 8px;
			padding-inline-end: 0;
			padding-block-end: 0;
			padding-inline-start: 0;
			color: var(--fgTransparentWeak);

			&:empty {
				display: none;
			}
		}

		> .input {
			position: relative;

			> input {
				appearance: none;
				-webkit-appearance: none;
				display: block;
				block-size: v-bind("height + 'px'");
				inline-size: 100%;
				margin: 0;
				padding-block: 0;
				padding-inline: 12px;
				font: inherit;
				font-weight: normal;
				font-size: 1em;
				color: var(--fg);
				background: var(--panel);
				border: solid 1px var(--panel);
				border-radius: 6px;
				outline: none;
				box-shadow: none;
				box-sizing: border-box;
				transition: border-color 0.1s ease-out;

				&:hover {
					border-color: var(--inputBorderHover) !important;
				}
			}

			> .prefix,
			> .suffix {
				display: flex;
				align-items: center;
				position: absolute;
				z-index: 1;
				inset-block-start: 0;
				padding-block: 0;
				padding-inline: 12px;
				font-size: 1em;
				block-size: v-bind("height + 'px'");
				pointer-events: none;

				&:empty {
					display: none;
				}

				> * {
					display: inline-block;
					min-inline-size: 16px;
					max-inline-size: 150px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				> :deep(button) {
					pointer-events: all;
				}
			}

			> .prefix {
				inset-inline-start: 0;
				padding-inline-end: 6px;
			}

			> .suffix {
				inset-inline-end: 0;
				padding-inline-start: 6px;
			}

			&.inline {
				display: inline-block;
				margin: 0;
			}

			&.focused {
				> input {
					border-color: var(--accent) !important;
					//box-shadow: 0 0 0 4px var(--focus);
				}
			}

			&.disabled {
				opacity: 0.7;

				&,
				* {
					cursor: not-allowed !important;
				}
			}
		}
	}

	> .save {
		margin-block-start: 8px;
		margin-inline-end: 0;
		margin-block-end: 0;
		margin-inline-start: 0;
	}
}
</style>
