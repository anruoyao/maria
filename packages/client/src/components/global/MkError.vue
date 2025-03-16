<template>
	<transition :name="defaultStore.state.animation ? 'zoom' : ''" appear>
		<div class="mjndxjcg">
			<img
				src="/static-assets/badges/error.webp"
				class="_ghost"
				alt="Error"
			/>
			<p>
				<i :class="icon('ph-warning')"></i>
				{{ i18n.ts.somethingHappened }}
			</p>
			<MkButton class="button" @click.stop="() => $emit('retry')">
				{{ i18n.ts.retry }}
			</MkButton>
		</div>
	</transition>
</template>

<script lang="ts" setup>
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";
</script>

<style lang="scss" scoped>
.mjndxjcg {
	padding: 32px;
	text-align: center;
	align-items: center;

	> p {
		margin-block-start: 0;
		margin-inline-end: 0;
		margin-block-end: 8px;
		margin-inline-start: 0;
	}

	> .button {
		margin-block: 0;
		margin-inline: auto;
	}

	> img {
		vertical-align: bottom;
		inline-size: 128px;
		block-size: 128px;
		margin-block-end: 16px;
		border-radius: 16px;
	}
}
</style>
