<template>
	<XModalWindow
		ref="dialogEl"
		:width="800"
		:height="500"
		:scroll="false"
		:with-ok-button="true"
		@close="cancel()"
		@ok="ok()"
		@closed="$emit('closed')"
	>
		<template #header>{{ i18n.ts.cropImage }}</template>
		<template #default="{ width, height }">
			<div
				class="mk-cropper-dialog"
				:style="`--vw: ${width ? `${width}px` : '100%'}; --vh: ${
					height ? `${height}px` : '100%'
				};`"
			>
				<Transition name="fade">
					<div v-if="loading" class="loading">
						<MkLoading />
					</div>
				</Transition>
				<div class="container">
					<img
						ref="imgEl"
						:src="imgUrl"
						style="display: none"
						@load="onImageLoad"
					/>
				</div>
			</div>
		</template>
	</XModalWindow>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { entities } from "firefish-js";
import Cropper from "cropperjs";
import tinycolor from "tinycolor2";
import XModalWindow from "@/components/MkModalWindow.vue";
import * as os from "@/os";
import { me } from "@/me";
import { defaultStore } from "@/store";
import { apiUrl, url } from "@/config";
import { query } from "@/scripts/url";
import { i18n } from "@/i18n";

const emit = defineEmits<{
	(ev: "ok", cropped: entities.DriveFile): void;
	(ev: "cancel"): void;
	(ev: "closed"): void;
}>();

const props = defineProps<{
	file: entities.DriveFile;
	aspectRatio: number;
}>();

const imgUrl = `${url}/proxy/image.webp?${query({
	url: props.file.url,
})}`;
const dialogEl = ref<InstanceType<typeof XModalWindow>>();
const imgEl = ref<HTMLImageElement>();
let cropper: Cropper | null = null;
const loading = ref(true);

const ok = async () => {
	async function UploadCroppedImg(): Promise<entities.DriveFile> {
		const croppedCanvas = await cropper?.getCropperSelection()?.$toCanvas();

		const blob = await new Promise<Blob | null>((resolve) =>
			croppedCanvas!.toBlob((blob) => resolve(blob)),
		);

		// MDN says `null` may be passed if the image cannot be created for any reason.
		// But I don't think this is reachable for normal case.
		if (blob == null) {
			throw "Cropping image failed.";
		}

		const formData = new FormData();
		formData.append("file", blob);
		if (defaultStore.state.uploadFolder) {
			formData.append("folderId", defaultStore.state.uploadFolder);
		}

		const response = await fetch(`${apiUrl}/drive/files/create`, {
			method: "POST",
			body: formData,
			headers: {
				authorization: `Bearer ${me!.token}`,
			},
		});
		return await response.json();
	}

	const promise = UploadCroppedImg();

	os.promiseDialog(promise);

	const f = await promise;

	emit("ok", f);
	dialogEl.value!.close();
};

const cancel = () => {
	emit("cancel");
	dialogEl.value!.close();
};

const onImageLoad = () => {
	loading.value = false;

	if (cropper) {
		cropper.getCropperImage()!.$center("contain");
		cropper.getCropperSelection()!.$center();
	}
};

onMounted(() => {
	cropper = new Cropper(imgEl.value!, {});

	const computedStyle = getComputedStyle(document.documentElement);

	const selection = cropper.getCropperSelection()!;
	selection.themeColor = tinycolor(
		computedStyle.getPropertyValue("--accent"),
	).toHexString();
	selection.aspectRatio = props.aspectRatio;
	selection.initialAspectRatio = props.aspectRatio;
	selection.outlined = true;

	window.setTimeout(() => {
		cropper!.getCropperImage()!.$center("contain");
		selection.$center();
	}, 100);

	// モーダルオープンアニメーションが終わったあとで再度調整
	window.setTimeout(() => {
		cropper!.getCropperImage()!.$center("contain");
		selection.$center();
	}, 500);
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease 0.5s;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.mk-cropper-dialog {
	display: flex;
	flex-direction: column;
	inline-size: var(--vw);
	block-size: var(--vh);
	position: relative;

	> .loading {
		position: absolute;
		z-index: 10;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 100%;
		block-size: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		-webkit-backdrop-filter: var(--blur, blur(10px));
		backdrop-filter: var(--blur, blur(10px));
		background: rgba(0, 0, 0, 0.5);
	}

	> .container {
		flex: 1;
		inline-size: 100%;
		block-size: 100%;

		> ::v-deep(cropper-canvas) {
			inline-size: 100%;
			block-size: 100%;

			> cropper-selection > cropper-handle[action="move"] {
				background: transparent;
			}
		}
	}
}
</style>
