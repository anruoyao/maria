<template>
	<section class="vrtktovh _formBlock">
		<h3 class="label"><slot name="label"></slot></h3>
		<div class="main _formRoot">
			<slot></slot>
		</div>
	</section>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.vrtktovh {
	border-block-start: solid 0.5px var(--divider);
	border-block-end: solid 0.5px var(--divider);

	& + .vrtktovh {
		border-block-start: none;
	}

	&:first-child {
		border-block-start: none;
	}

	&:last-child {
		border-block-end: none;
	}

	> .label {
		font-weight: bold;
		margin-block-start: 1.5em;
		margin-inline-end: 0;
		margin-block-end: 16px;
		margin-inline-start: 0;
		font-size: 1em;

		&:empty {
			display: none;
		}
	}

	> .main {
		margin-block: 1.5em;
		margin-inline: 0;
	}
}
</style>
