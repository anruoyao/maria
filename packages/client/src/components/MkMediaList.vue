<template>
	<div class="hoawjimk files">
		<XBanner
			v-for="media in mediaList.filter((media) => !previewable(media))"
			:key="media.id"
			:media="media"
		/>
		<div
			v-if="previewableCount > 0"
			class="grid-container"
			:data-count="previewableCount < 5 ? previewableCount : null"
			:class="{ dmWidth: inDm }"
		>
			<div ref="gallery" @click.stop>
				<template
					v-for="media in mediaList.filter((media) =>
						previewable(media),
					)"
				>
					<XMedia
						v-if="
							media.type.startsWith('video') ||
							media.type.startsWith('image')
						"
						:key="`m-${media.id}`"
						:class="{ image: media.type.startsWith('image') }"
						:data-id="media.id"
						:media="media"
						:raw="raw"
					/>
					<XModPlayer
						v-else-if="isModule(media)"
						:key="`p-${media.id}`"
						:module="media"
					/>
				</template>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import type { entities } from "firefish-js";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import PhotoSwipe from "photoswipe";
import "photoswipe/style.css";
import XBanner from "@/components/MkMediaBanner.vue";
import XMedia from "@/components/MkMedia.vue";
import XModPlayer from "@/components/MkModPlayer.vue";
// import * as os from "@/os";
import {
	FILE_EXT_TRACKER_MODULES,
	FILE_TYPE_BROWSERSAFE,
	FILE_TYPE_TRACKER_MODULES,
} from "@/const";

const props = defineProps<{
	mediaList: entities.DriveFile[];
	raw?: boolean;
	inDm?: boolean;
}>();

const gallery = ref<HTMLElement | null>(null);
// const pswpZIndex = os.claimZIndex("middle");

onMounted(() => {
	const lightbox = new PhotoSwipeLightbox({
		dataSource: props.mediaList
			.filter((media) => {
				if (media.type === "image/svg+xml") return true; // svgのwebpublicはpngなのでtrue
				return (
					media.type.startsWith("image") &&
					FILE_TYPE_BROWSERSAFE.includes(media.type)
				);
			})
			.map((media) => {
				const item = {
					src: media.url,
					w: media.properties.width,
					h: media.properties.height,
					alt: media.comment || undefined,
				};
				if (
					media.properties.orientation != null &&
					media.properties.orientation >= 5
				) {
					[item.w, item.h] = [item.h, item.w];
				}
				return item;
			}),
		gallery: gallery.value || undefined,
		children: ".image",
		thumbSelector: ".image img",
		loop: false,
		padding:
			window.innerWidth > 500
				? {
						top: 32,
						bottom: 32,
						left: 32,
						right: 32,
					}
				: {
						top: 0,
						bottom: 0,
						left: 0,
						right: 0,
					},
		imageClickAction: "close",
		tapAction: "toggle-controls",
		preloadFirstSlide: false,
		pswpModule: PhotoSwipe,
	});

	lightbox.on("itemData", (ev) => {
		const { itemData } = ev;

		// element is children
		const { element } = itemData;

		if (element == null) return;

		const id = element.dataset.id;
		const file = props.mediaList.find((media) => media.id === id);

		if (file == null) return;

		itemData.src = file.url;
		itemData.w = Number(file.properties.width);
		itemData.h = Number(file.properties.height);
		if (
			file.properties.orientation != null &&
			file.properties.orientation >= 5
		) {
			[itemData.w, itemData.h] = [itemData.h, itemData.w];
		}
		itemData.msrc = file.thumbnailUrl;
		itemData.alt = file.comment || undefined;
		itemData.thumbCropped = true;
	});

	lightbox.on("uiRegister", () => {
		lightbox.pswp?.ui?.registerElement({
			name: "altText",
			className: "pwsp__alt-text-container",
			appendTo: "wrapper",
			onInit: (el, pwsp) => {
				const textBox = document.createElement("p");
				textBox.className = "pwsp__alt-text";
				el.appendChild(textBox);

				const preventProp = (ev: Event): void => {
					ev.stopPropagation();
				};

				// Allow scrolling/text selection
				el.onwheel = preventProp;
				el.onclick = preventProp;
				el.onpointerdown = preventProp;
				el.onpointercancel = preventProp;
				el.onpointermove = preventProp;

				pwsp.on("change", () => {
					textBox.textContent = pwsp.currSlide?.data.alt?.trim() ?? null;
				});
			},
		});
	});

	lightbox.on("afterInit", () => {
		history.pushState(null, "", location.href);
		addEventListener("popstate", close);
		// This is a workaround. Not sure why, but when clicking to open, it doesn't move focus to the photoswipe. Preventing using esc to close. However when using keyboard to open it already focuses the lightbox fine.
		lightbox.pswp?.element?.focus();
	});
	lightbox.on("close", () => {
		removeEventListener("popstate", close);
		history.back();
	});

	lightbox.init();

	function close() {
		removeEventListener("popstate", close);
		history.forward();
		lightbox.pswp?.close();
	}
});

const previewable = (file: entities.DriveFile): boolean => {
	if (file.type === "image/svg+xml") return true; // svgのwebpublic/thumbnailはpngなのでtrue
	// FILE_TYPE_BROWSERSAFEに適合しないものはブラウザで表示するのに不適切
	if (isModule(file)) return true;
	return (
		(file.type.startsWith("video") || file.type.startsWith("image")) &&
		FILE_TYPE_BROWSERSAFE.includes(file.type)
	);
};

const isModule = (file: entities.DriveFile): boolean => {
	return (
		FILE_TYPE_TRACKER_MODULES.includes(file.type) ||
		FILE_EXT_TRACKER_MODULES.some((ext) => {
			return file.name.toLowerCase().endsWith(`.${ext}`);
		})
	);
};

const previewableCount = computed(
	() => props.mediaList.filter((media) => previewable(media)).length,
);
</script>

<style lang="scss" scoped>
.hoawjimk {
	> .dmWidth {
		min-inline-size: 20rem;
		max-inline-size: 40rem;
	}

	> .grid-container {
		position: relative;
		inline-size: 100%;
		margin-block-start: 4px;
		border-radius: var(--radius);
		overflow: hidden;
		pointer-events: none;

		&[data-count] {
			padding-block-start: 56.25%; // 16:9;
			> div {
				position: absolute;
				inset: 0;
			}
		}

		&[data-count="1"] > div {
			grid-template-rows: 1fr;
		}

		&[data-count="2"] > div {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr;
		}

		&[data-count="3"] > div {
			grid-template-columns: 1fr 0.5fr;
			grid-template-rows: 1fr 1fr;

			> *:nth-child(1) {
				grid-row: 1 / 3;
			}

			> *:nth-child(3) {
				grid-column: 2 / 3;
				grid-row: 2 / 3;
			}
		}

		&[data-count="4"] > div {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
		}

		&:not([data-count]) > div > div {
			max-block-size: 300px;
		}

		> div {
			display: grid;
			grid-gap: 8px;

			> div,
			> button {
				overflow: hidden;
				border-radius: 6px;
				pointer-events: all;
				min-block-size: 50px;
			}

			> :nth-child(1) {
				grid-column: 1 / 2;
				grid-row: 1 / 2;
			}

			> :nth-child(2) {
				grid-column: 2 / 3;
				grid-row: 1 / 2;
			}

			> :nth-child(3) {
				grid-column: 1 / 2;
				grid-row: 2 / 3;
			}

			> :nth-child(4) {
				grid-column: 2 / 3;
				grid-row: 2 / 3;
			}
		}
	}
}
</style>

<style lang="scss">
.pswp {
	// なぜか機能しない
	//z-index: v-bind(pswpZIndex);
	z-index: 2000000;
}
.pwsp__alt-text-container {
	display: flex;
	flex-direction: row;
	align-items: center;

	position: absolute;
	inset-block-end: 30px;
	inset-inline-start: 50%;
	transform: translateX(-50%);

	inline-size: 75%;

	&:dir(rtl) {
		inset-inline-start: auto;
		inset-inline-end: 50%;
	}

	.vertical-rl &, .vertical-lr & {
		transform: translateY(-50%);
	}

	.vertical-rl:not(.upright) &:dir(rtl), .vertical-lr:dir(rtl):not(.upright) & {
		inset-inline-end: 50%;
		inset-inline-start: auto;
	}
}

.pwsp__alt-text {
	color: white;
	margin-block: 0;
	margin-inline: auto;
	text-align: center;
	padding: 10px;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 5px;

	max-block-size: 10vb;
	overflow-x: clip;
	overflow-inline: clip;
	overflow-y: auto;
	overflow-block: auto;
	overscroll-behavior: contain;
	white-space: pre-line;
			
	@supports not (overflow-block: auto) {
		.vertical-lr &, .vertical-rl & {
			overflow-x: auto;
			overflow-y: clip;
		}
	}
}

.pwsp__alt-text:empty {
	display: none;
}
</style>
