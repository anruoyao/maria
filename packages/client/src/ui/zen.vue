<template>
	<div class="mk-app">
		<RouterView />

		<XCommon />
	</div>
</template>

<script lang="ts" setup>
import type { ComputedRef } from "vue";
import { provide, ref } from "vue";
import XCommon from "./_common_/common.vue";
import { mainRouter } from "@/router";
import type { PageMetadata } from "@/scripts/page-metadata";
import {
	provideMetadataReceiver,
	setPageMetadata,
} from "@/scripts/page-metadata";
import { instanceName } from "@/config";

const pageMetadata = ref<null | ComputedRef<PageMetadata>>();

provide("router", mainRouter);
provideMetadataReceiver((info) => {
	pageMetadata.value = info;
	if (pageMetadata.value.value) {
		document.title = `${pageMetadata.value.value.title} | ${instanceName}`;
	}
});

document.documentElement.style.overflowBlock = "scroll";
</script>

<style lang="scss" scoped>
.mk-app {
	min-block-size: 100dvb;
	box-sizing: border-box;
}
</style>
