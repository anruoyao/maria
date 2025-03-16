<template>
	<details class="dwzlatin" :open="defaultOpen">
		<summary class="header _button">
			<span class="icon"><slot name="icon"></slot></span>
			<span class="text"><slot name="label"></slot></span>
			<span class="right">
				<span class="text"><slot name="suffix"></slot></span>
				<i v-if="opened" :class="icon('ph-caret-up ph-dir icon')"></i>
				<i v-else :class="icon('ph-caret-down ph-dir icon')"></i>
			</span>
		</summary>
		<div class="body">
			<MkSpacer :margin-min="14" :margin-max="22">
				<slot></slot>
			</MkSpacer>
		</div>
	</details>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import icon from "@/scripts/icon";

const props = defineProps<{
	defaultOpen: boolean;
}>();

const opened = ref(props.defaultOpen);
</script>

<style lang="scss" scoped>
.dwzlatin {
	display: block;
	overflow: clip;
	border-radius: 6px;

	> .header {
		display: flex;
		align-items: center;
		inline-size: 100%;
		box-sizing: border-box;
		padding-block-start: 12px;
		padding-inline-end: 14px;
		padding-block-end: 12px;
		padding-inline-start: 14px;
		background: var(--buttonBg);

		&:hover {
			text-decoration: none;
			background: var(--buttonHoverBg);
		}

		&.active {
			color: var(--accent);
			background: var(--buttonHoverBg);
		}

		> .icon {
			margin-inline-end: 0.75em;
			flex-shrink: 0;
			text-align: center;
			opacity: 0.8;

			&:empty {
				display: none;

				& + .text {
					padding-inline-start: 4px;
				}
			}
		}

		> .text {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			padding-inline-end: 12px;
		}

		> .right {
			margin-inline-start: auto;
			opacity: 0.7;
			white-space: nowrap;

			> .text:not(:empty) {
				margin-inline-end: 0.75em;
			}
		}
	}

	> .body {
		background: var(--panel);
		border-radius: 0 0 6px 6px;
	}
}
</style>
