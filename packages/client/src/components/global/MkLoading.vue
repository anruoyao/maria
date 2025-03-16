<template>
	<div
		:class="[
			$style.root,
			{
				[$style.inline]: inline,
				[$style.colored]: colored,
				[$style.mini]: mini,
				[$style.em]: em,
			},
		]"
	>
		<div :class="$style.container" aria-hidden="true">
			<svg
				:class="[$style.spinner]"
				viewBox="0 0 50 50"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					:class="[$style.path]"
					cx="25"
					cy="25"
					r="20"
					fill="none"
					stroke-width="6px"
					style="fill: none; stroke: currentColor; stroke-width: 6px"
				></circle>
			</svg>
		</div>
	</div>
</template>

<script lang="ts" setup>
withDefaults(
	defineProps<{
		inline?: boolean;
		colored?: boolean;
		mini?: boolean;
		em?: boolean;
		sizeEm?: number;
	}>(),
	{
		inline: false,
		colored: true,
		mini: false,
		em: false,
		sizeEm: 1,
	},
);
</script>

<style lang="scss" module>
/* Credit to https://codepen.io/supah/pen/BjYLdW */

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes dash {
	0% {
		stroke-dasharray: 1, 150;
		stroke-dashoffset: 0;
	}
	50% {
		stroke-dasharray: 90, 150;
		stroke-dashoffset: -35;
	}
	100% {
		stroke-dasharray: 90, 150;
		stroke-dashoffset: -124;
	}
}

.root {
	padding: 32px;
	text-align: center;
	cursor: wait;

	--size: 40px;

	&.colored {
		color: var(--accent);
	}

	&.inline {
		display: inline;
		padding: 0;
		--size: 32px;
	}

	&.mini {
		padding: 16px;
		--size: 32px;
	}
	&.em {
		display: inline-block;
		vertical-align: middle;
		padding: 0;
		--size: v-bind(`${sizeEm}em`);
	}
}

.container {
	position: relative;
	inline-size: var(--size);
	block-size: var(--size);
	margin-block: 0;
	margin-inline: auto;
}

.spinner {
	position: absolute;
	inset-block-start: 0;
	inset-inline-start: 0;
	z-index: 999;
	inline-size: var(--size);
	block-size: var(--size);
	animation: spin 2s linear infinite;
}

.path {
	stroke: var(--accent);
	stroke-linecap: round;
	animation: dash 1.2s ease-in-out infinite;
}
</style>
