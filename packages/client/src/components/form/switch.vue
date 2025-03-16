<template>
	<label class="ziffeomt">
		<input
			type="checkbox"
			:checked="toValue(modelValue)"
			:disabled="disabled"
			@change="(x) => toggle(x)"
		/>
		<div class="button">
			<div class="knob"></div>
		</div>
		<span class="label">
			<!-- TODO: 無名slotの方は廃止 -->
			<span><slot name="label"></slot><slot></slot></span>
			<p class="caption"><slot name="caption"></slot></p>
		</span>
	</label>
</template>

<script lang="ts" setup>
import { type Ref, toValue } from "vue";

const props = defineProps<{
	modelValue: boolean | Ref<boolean>;
	disabled?: boolean;
}>();

const emit = defineEmits<{
	"update:modelValue": [v: boolean];
}>();

function toggle(x: Event) {
	if (props.disabled) return;
	emit("update:modelValue", (x.target as HTMLInputElement).checked);
}
</script>

<style lang="scss" scoped>
.ziffeomt {
	position: relative;
	display: flex;
	transition: all 0.2s ease;

	> * {
		user-select: none;
	}

	> input {
		position: absolute;
		inline-size: 32px;
		block-size: 23px;
		opacity: 0;
		margin: 0;
	}

	> .button {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		margin: 0;
		box-sizing: border-box;
		inline-size: 32px;
		block-size: 23px;
		outline: none;
		background: var(--swutchOffBg);
		background-clip: content-box;
		border: solid 1px var(--swutchOffBg);
		border-radius: 999px;
		transition: inherit;
		user-select: none;
		pointer-events: none;

		> .knob {
			position: absolute;
			inset-block-start: 3px;
			inset-inline-start: 3px;
			inline-size: 15px;
			block-size: 15px;
			background: var(--swutchOffFg);
			border-radius: 999px;
			transition: all 0.2s ease;
		}
	}

	&:hover {
		> .button {
			border-color: var(--inputBorderHover) !important;
		}
	}
	&:focus-within > .button {
		outline: auto;
	}

	> .label {
		margin-inline-start: 12px;
		margin-block-start: 2px;
		display: block;
		transition: inherit;
		color: var(--fg);
		text-align: initial;

		> span {
			display: block;
			line-height: 20px;
			cursor: pointer;
			transition: inherit;
		}

		> .caption {
			margin-block-start: 8px;
			margin-inline-end: 0;
			margin-block-end: 0;
			margin-inline-start: 0;
			color: var(--fgTransparentWeak);
			font-size: 0.85em;

			&:empty {
				display: none;
			}
		}
	}

	> input:disabled ~ * {
		opacity: 0.6;
		cursor: not-allowed;
	}

	> input:checked ~ .button {
		background-color: var(--swutchOnBg) !important;
		border-color: var(--swutchOnBg) !important;

		> .knob {
			inset-inline-start: 12px;
			background: var(--swutchOnFg);
		}
	}
}
</style>
