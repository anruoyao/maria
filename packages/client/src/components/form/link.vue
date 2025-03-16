<template>
	<div class="ffcbddfc" :class="{ inline }">
		<a v-if="external" class="main _button" :href="to" target="_blank">
			<span class="icon"><slot name="icon"></slot></span>
			<span class="text"><slot></slot></span>
			<span class="right">
				<span class="text"><slot name="suffix"></slot></span>
				<i :class="icon('ph-arrow-square-out icon')"></i>
			</span>
		</a>
		<MkA
			v-else
			class="main _button"
			:class="{ active }"
			:to="to"
			:behavior="behavior"
		>
			<span class="icon"><slot name="icon"></slot></span>
			<span class="text"><slot></slot></span>
			<span class="right">
				<span class="text"><slot name="suffix"></slot></span>
				<i :class="icon('ph-caret-right icon ph-dir')"></i>
			</span>
		</MkA>
	</div>
</template>

<script lang="ts" setup>
import icon from "@/scripts/icon";

defineProps<{
	to: string;
	active?: boolean;
	external?: boolean;
	behavior?: null | "window" | "browser" | "modalWindow";
	inline?: boolean;
}>();
</script>

<style lang="scss" scoped>
.ffcbddfc {
	display: block;

	&.inline {
		display: inline-block;
	}

	> .main {
		display: flex;
		align-items: center;
		inline-size: 100%;
		box-sizing: border-box;
		padding-block: 10px;
		padding-inline: 14px;
		background: var(--buttonBg);
		border-radius: 6px;
		font-size: 0.9em;

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
			color: var(--fgTransparentWeak);

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
}
</style>
