<template>
	<label v-adaptive-border class="novjtctn" :class="{ disabled, checked }">
		<input
			type="radio"
			:disabled="disabled"
			:checked="checked"
			@change="(x) => toggle(x)"
		/>
		<span class="button">
			<span></span>
		</span>
		<span class="label"><slot></slot></span>
	</label>
</template>

<script lang="ts" setup>
import { computed } from "vue";

// biome-ignore lint/suspicious/noExplicitAny: FIXME
type ValueType = any;

const props = defineProps<{
	modelValue: ValueType;
	value: ValueType;
	disabled: boolean;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: ValueType];
}>();

const checked = computed(() => props.modelValue === props.value);

function toggle(_ev: Event) {
	if (props.disabled) return;
	emit("update:modelValue", props.value);
}
</script>

<style lang="scss" scoped>
.novjtctn {
	position: relative;
	display: inline-block;
	text-align: start;
	cursor: pointer;
	padding-block: 8px;
	padding-inline: 10px;
	min-inline-size: 60px;
	background-color: var(--panel);
	background-clip: padding-box !important;
	border: solid 1px var(--panel);
	border-radius: 6px;
	transition: all 0.2s;

	> * {
		user-select: none;
	}

	&.disabled {
		opacity: 0.6;

		&,
		* {
			cursor: not-allowed !important;
		}
	}

	&:hover {
		border-color: var(--inputBorderHover) !important;
	}
	&:focus-within {
		outline: auto;
	}

	&.checked {
		background-color: var(--accentedBg) !important;
		border-color: var(--accentedBg) !important;
		color: var(--accent);

		&,
		* {
			cursor: default !important;
		}

		> .button {
			border-color: var(--accent);

			&:after {
				background-color: var(--accent);
				transform: scale(1);
				opacity: 1;
			}
		}
	}

	> input {
		position: absolute;
		inline-size: 18px;
		block-size: 18px;
		opacity: 0;
		margin: 0;
	}

	> .button {
		position: absolute;
		inline-size: 14px;
		block-size: 14px;
		background: none;
		border: solid 2px var(--inputBorder);
		border-radius: 100%;
		transition: inherit;
		pointer-events: none;

		&:after {
			content: "";
			display: block;
			position: absolute;
			inset: 3px;
			border-radius: 100%;
			opacity: 0;
			transform: scale(0);
			transition: 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
		}
	}

	> .label {
		margin-inline-start: 28px;
		display: block;
		line-height: 20px;
		cursor: pointer;
	}
}
</style>
