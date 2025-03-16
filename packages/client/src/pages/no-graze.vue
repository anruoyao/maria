<template>
	<transition :name="defaultStore.state.animation ? 'zoom' : ''" appear>
		<div :class="$style.root">
			<img
				src="/static-assets/badges/info.webp"
				class="_ghost"
				alt="Error"
			/>
			<p>
				<i :class="icon('ph-warning')"></i>
				{{ i18n.ts.noGraze }}
			</p>
		</div>
	</transition>
</template>

<script lang="ts" setup>
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";
</script>

<style lang="scss" module>
.root {
	padding: 32px;
	text-align: center;

	> p {
		margin-block-start: 0;
		margin-inline-end: 0;
		margin-block-end: 8px;
		margin-inline-start: 0;
	}

	> img {
		vertical-align: bottom;
		block-size: 128px;
		margin-block-end: 16px;
		border-radius: 16px;
	}
}
</style>
