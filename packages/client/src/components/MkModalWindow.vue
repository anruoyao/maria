<template>
	<MkModal
		ref="modal"
		:prefer-type="'dialog'"
		@click="onBgClick"
		@keyup.esc="$emit('close')"
		@closed="$emit('closed')"
	>
		<FocusTrap v-model:active="isActive">
			<div
				ref="rootEl"
				class="ebkgoccj"
				:style="{
					inlineSize: `${props.width}px`,
					blockSize: scroll
						? height
							? `${props.height}px`
							: undefined
						: height
							? `min(${props.height}px, 100%)`
							: '100%',
				}"
				tabindex="-1"
			>
				<div ref="headerEl" class="header">
					<button
						v-if="props.withOkButton"
						v-tooltip="i18n.ts.close"
						:aria-label="i18n.ts.close"
						class="_button"
						@click="$emit('close')"
					>
						<i :class="icon('ph-x')"></i>
					</button>
					<span class="title">
						<slot name="header"></slot>
					</span>
					<button
						v-if="!props.withOkButton"
						:aria-label="i18n.ts.close"
						class="_button"
						@click="$emit('close')"
					>
						<i :class="icon('ph-x')"></i>
					</button>
					<button
						v-if="props.withOkButton"
						:aria-label="i18n.ts.ok"
						class="_button"
						:disabled="props.okButtonDisabled"
						@click="$emit('ok')"
					>
						<i :class="icon('ph-check')"></i>
					</button>
				</div>
				<div class="body">
					<slot
						:width="width"
						:height="height"
					></slot>
				</div>
			</div>
		</FocusTrap>
	</MkModal>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from "vue";

import { FocusTrap } from "focus-trap-vue";
import MkModal from "./MkModal.vue";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const props = withDefaults(
	defineProps<{
		withOkButton: boolean;
		okButtonDisabled: boolean;
		width: number;
		height: number | null;
		scroll: boolean;
	}>(),
	{
		withOkButton: false,
		okButtonDisabled: false,
		width: 400,
		height: null,
		scroll: true,
	},
);

const emit = defineEmits<{
	(event: "click"): void;
	(event: "close"): void;
	(event: "closed"): void;
	(event: "ok"): void;
}>();

// FIXME: seems that this is not used
const isActive = ref();

const modal = shallowRef<InstanceType<typeof MkModal>>();
const rootEl = shallowRef<HTMLElement>();
const headerEl = shallowRef<HTMLElement>();

const close = (ev?) => {
	modal.value?.close(ev);
};

const onBgClick = () => {
	emit("click");
};

defineExpose({
	close,
});
</script>

<style lang="scss" scoped>
.ebkgoccj {
	margin: auto;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	contain: content;
	container-type: inline-size;
	border-radius: var(--radius);

	--root-margin: 24px;

	@media (max-inline-size: 500px) {
		--root-margin: 16px;
	}

	> .header {
		$height: 46px;
		$height-narrow: 42px;
		display: flex;
		flex-shrink: 0;
		background: var(--windowHeader);
		-webkit-backdrop-filter: var(--blur, blur(15px));
		backdrop-filter: var(--blur, blur(15px));

		> button {
			block-size: $height;
			inline-size: $height;

			@media (max-inline-size: 500px) {
				block-size: $height-narrow;
				inline-size: $height-narrow;
			}
		}

		> .title {
			flex: 1;
			line-height: $height;
			padding-inline-start: 32px;
			font-weight: bold;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			pointer-events: none;

			@media (max-inline-size: 500px) {
				line-height: $height-narrow;
				padding-inline-start: 16px;
			}
		}

		> button + .title {
			padding-inline-start: 0;
		}
	}

	> .body {
		flex: 1;
		overflow: auto;
		background: var(--panel);
	}
}
</style>
