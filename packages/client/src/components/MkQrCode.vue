<template>
	<MkModal ref="modal" :z-priority="'middle'" @closed="$emit('closed')">
		<div :class="$style.root">
			<div :class="$style.title">
				<QRCodeVue3
          :value="qrCode"
        />
			</div>
			<div class="_flexList" style="gap: 0.6rem">
				<MkButton :class="$style.gotIt" primary full @click="gotIt()">{{
					i18n.ts.gotIt
				}}</MkButton>
				<MkButton :class="$style.copyLink" full @click="copyLink()">{{
					i18n.ts.copyLink
				}}</MkButton>
			</div>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";
import QRCodeVue3 from "qrcode-vue3";
import MkModal from "@/components/MkModal.vue";
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import copyToClipboard from "@/scripts/copy-to-clipboard";

const props = defineProps<{
	qrCode: string;
}>();

const modal = shallowRef<InstanceType<typeof MkModal>>();

const gotIt = () => {
	modal.value.close();
};

const copyLink = () => {
	copyToClipboard(props.qrCode);
	os.success();
};
</script>

<style lang="scss" module>
.root {
	margin: auto;
	position: relative;
	padding: 32px;
	min-inline-size: 320px;
	max-inline-size: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);

	> img {
		border-radius: 10px;
		max-block-size: 100%;
		max-inline-size: 100%;
	}
}

.title {
	font-weight: bold;

	> p {
		margin: 0;
	}
}

.time {
	font-size: 0.8rem;
}

.gotIt {
	margin-block-start: 8px;
	margin-inline-end: 0;
	margin-block-end: 0;
	margin-inline-start: 0;
}
</style>
