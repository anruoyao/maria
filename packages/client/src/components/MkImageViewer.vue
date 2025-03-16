<template>
	<MkModal
		ref="modal"
		:z-priority="'middle'"
		@click="modal!.close()"
		@closed="emit('closed')"
	>
		<div class="xubzgfga">
			<header>{{ image.name }}</header>
			<img
				:src="image.url"
				:alt="image.comment || undefined"
				:title="image.comment || undefined"
				@click="modal!.close()"
			/>
			<footer>
				<span>{{ image.type }}</span>
				<span>{{ bytes(image.size) }}</span>
				<span v-if="image.properties && image.properties.width"
					>{{ number(image.properties.width) }}px ×
					{{ number(image.properties.height) }}px</span
				>
			</footer>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import type { entities } from "firefish-js";
import bytes from "@/filters/bytes";
import number from "@/filters/number";
import MkModal from "@/components/MkModal.vue";

withDefaults(
	defineProps<{
		image: entities.DriveFile;
	}>(),
	{},
);

const emit = defineEmits<{
	closed: [];
}>();

const modal = ref<InstanceType<typeof MkModal> | null>(null);
</script>

<style lang="scss" scoped>
.xubzgfga {
	display: flex;
	flex-direction: column;
	block-size: 100%;

	> header,
	> footer {
		align-self: center;
		display: inline-block;
		padding-block: 6px;
		padding-inline: 9px;
		font-size: 90%;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 6px;
		color: #fff;
	}

	> header {
		margin-block-end: 8px;
		opacity: 0.9;
	}

	> img {
		display: block;
		flex: 1;
		min-block-size: 0;
		object-fit: contain;
		inline-size: 100%;
		cursor: zoom-out;
		image-orientation: from-image;
	}

	> footer {
		margin-block-start: 8px;
		opacity: 0.8;

		> span + span {
			margin-inline-start: 0.5em;
			padding-inline-start: 0.5em;
			border-inline-start: solid 1px rgba(255, 255, 255, 0.5);
		}
	}
}
</style>
