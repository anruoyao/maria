<template>
	<div class="vblkjoeq">
		<div class="label" @click="focus"><slot name="label"></slot></div>
		<div
			ref="container"
			class="input"
			:class="{ inline, disabled, focused }"
			@mousedown.prevent="show"
		>
			<div ref="prefixEl" class="prefix"><slot name="prefix"></slot></div>
			<select
				ref="inputEl"
				v-model="v"
				v-adaptive-border
				class="select"
				:disabled="disabled"
				:required="required"
				:readonly="readonly"
				:placeholder="placeholder"
				@focus="focused = true"
				@blur="focused = false"
				@input="onInput"
			>
				<slot></slot>
			</select>
			<div ref="suffixEl" class="suffix">
				<i
					class="ph-caret-down ph-lg"
					:class="[
						$style.chevron,
						{ [$style.chevronOpening]: opening },
					]"
				></i>
			</div>
		</div>
		<div class="caption"><slot name="caption"></slot></div>

		<MkButton v-if="manualSave && changed" primary @click="updated"
			><i :class="icon('ph-floppy-disk-back')"></i>
			{{ i18n.ts.save }}</MkButton
		>
	</div>
</template>

<script lang="ts" setup>
import type { VNode } from "vue";
import {
	computed,
	nextTick,
	onMounted,
	ref,
	toRefs,
	useSlots,
	watch,
} from "vue";
import MkButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { useInterval } from "@/scripts/use-interval";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";
import type { MenuItem } from "@/types/menu";

const props = defineProps<{
	modelValue: string | null;
	required?: boolean;
	readonly?: boolean;
	disabled?: boolean;
	placeholder?: string;
	autofocus?: boolean;
	inline?: boolean;
	manualSave?: boolean;
	small?: boolean;
	large?: boolean;
}>();

const emit = defineEmits<{
	(ev: "change", _ev: KeyboardEvent): void;
	(ev: "update:modelValue", value: string | null): void;
}>();

const slots = useSlots();

const { modelValue, autofocus } = toRefs(props);
const v = ref(modelValue.value);
const focused = ref(false);
const opening = ref(false);
const changed = ref(false);
const invalid = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);
const prefixEl = ref<HTMLElement | null>(null);
const suffixEl = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | null>(null);
const height = props.small ? 33 : props.large ? 39 : 36;

const focus = () => inputEl.value!.focus();
const onInput = (ev) => {
	changed.value = true;
	emit("change", ev);
};

const updated = () => {
	changed.value = false;
	emit("update:modelValue", v.value);
};

watch(modelValue, (newValue) => {
	v.value = newValue;
});

watch(v, (_newValue) => {
	if (!props.manualSave) {
		updated();
	}

	invalid.value = inputEl.value!.validity.badInput;
});

// このコンポーネントが作成された時、非表示状態である場合がある
// 非表示状態だと要素の幅などは0になってしまうので、定期的に計算する
useInterval(
	() => {
		if (inputEl.value == null) return;
		if (prefixEl.value) {
			if (prefixEl.value.offsetWidth) {
				inputEl.value.style.paddingInlineStart = `${prefixEl.value.offsetWidth}px`;
			}
		}
		if (suffixEl.value) {
			if (suffixEl.value.offsetWidth) {
				inputEl.value.style.paddingInlineEnd = `${suffixEl.value.offsetWidth}px`;
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

function show(_ev: MouseEvent) {
	focused.value = true;
	opening.value = true;

	const menu: MenuItem[] = [];
	const options = slots.default!();

	const pushOption = (option: VNode) => {
		menu.push({
			text: option.children as string,
			active: computed(() => v.value === option.props?.value).value,
			action: () => {
				v.value = option.props?.value;
			},
		});
	};

	const scanOptions = (options: VNode[]) => {
		for (const vnode of options) {
			if (vnode.type === "optgroup") {
				const optgroup = vnode;
				menu.push({
					type: "label",
					text: optgroup.props?.label,
				});
				scanOptions(optgroup.children as VNode[]);
			} else if (Array.isArray(vnode.children)) {
				// 何故かフラグメントになってくることがある
				const fragment = vnode;
				scanOptions(fragment.children as VNode[]);
			} else if (vnode.props == null) {
				// v-if で条件が false のときにこうなる
				// nop?
			} else {
				const option = vnode;
				pushOption(option);
			}
		}
	};

	scanOptions(options);

	os.popupMenu(menu, container.value!, {
		width: getComputedStyle(container.value!)["writing-mode"].startsWith(
			"vertical",
		)
			? container.value!.offsetHeight
			: container.value!.offsetWidth,
		// onClosing: () => {
		// 	opening.value = false;
		// },
	}).then(() => {
		opening.value = false;
		focused.value = false;
	});
}
</script>

<style lang="scss" scoped>
.vblkjoeq {
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
		cursor: pointer;

		&:hover {
			> .select {
				border-color: var(--inputBorderHover) !important;
			}
		}

		> .select {
			appearance: none;
			-webkit-appearance: none;
			display: block;
			block-size: v-bind("height + 'px'");
			line-height: v-bind("height + 'px'");
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
			cursor: pointer;
			transition: border-color 0.1s ease-out;
			pointer-events: none;
			user-select: none;
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
			> select {
				border-color: var(--accent) !important;
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
</style>

<style lang="scss" module>
.chevron {
	transition: transform 0.1s ease-out;
}

.chevronOpening {
	transform: rotateX(180deg);
}
</style>
