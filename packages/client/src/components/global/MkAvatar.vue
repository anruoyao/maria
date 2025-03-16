<template>
	<span
		v-if="disableLink"
		v-user-preview="disablePreview ? undefined : user.id"
		class="eiwwqkts _noSelect"
		:class="{
			cat: user.isCat,
			square: user.isCat
				? defaultStore.state.squareCatAvatars
				: defaultStore.state.squareAvatars,
		}"
		:style="{ color }"
		:title="acct.toString(user)"
		@click="onClick"
	>
		<img class="inner" :src="url" decoding="async" />
		<MkUserOnlineIndicator
			v-if="showIndicator && user.instance == null"
			class="indicator"
			:user="user"
		/>
	</span>
	<span
		v-else-if="showLightBox"
		ref="gallery"
		v-user-preview="disablePreview ? undefined : user.id"
		class="eiwwqkts _noSelect showLightBox"
		:class="{
			cat: user.isCat,
			square: user.isCat
				? defaultStore.state.squareCatAvatars
				: defaultStore.state.squareAvatars,
		}"
		:style="{ color }"
		:title="acct.toString(user)"
		@click.stop
	>
		<img class="inner avatar" :src="url" decoding="async" />
		<MkUserOnlineIndicator
			v-if="showIndicator && user.instance == null"
			class="indicator"
			:user="user"
		/>
	</span>
	<MkA
		v-else
		v-user-preview="disablePreview ? undefined : user.id"
		class="eiwwqkts _noSelect"
		:class="{
			cat: user.isCat,
			square: user.isCat
				? defaultStore.state.squareCatAvatars
				: defaultStore.state.squareAvatars,
		}"
		:style="{ color }"
		:to="userPage(user)"
		:title="acct.toString(user)"
		:target="target"
		@click.stop
	>
		<img class="inner" :src="url" decoding="async" />
		<MkUserOnlineIndicator
			v-if="showIndicator && user.instance == null"
			class="indicator"
			:user="user"
		/>
	</MkA>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { acct, type entities } from "firefish-js";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import PhotoSwipe from "photoswipe";
import { getStaticImageUrl } from "@/scripts/get-static-image-url";
import { extractAvgColorFromBlurhash } from "@/scripts/extract-avg-color-from-blurhash";
import { userPage } from "@/filters/user";
import MkUserOnlineIndicator from "@/components/MkUserOnlineIndicator.vue";
import { defaultStore } from "@/store";
import "photoswipe/style.css";

const props = withDefaults(
	defineProps<{
		user: entities.User;
		target?: string | null;
		disableLink?: boolean;
		showLightBox?: boolean;
		disablePreview?: boolean;
		showIndicator?: boolean;
	}>(),
	{
		target: null,
		disableLink: false,
		showLightBox: false,
		disablePreview: false,
		showIndicator: false,
	},
);

const emit = defineEmits<{
	click: [v: MouseEvent];
}>();

const url = computed(() =>
	defaultStore.state.disableShowingAnimatedImages
		? getStaticImageUrl(props.user.avatarUrl)
		: props.user.avatarUrl,
);

function onClick(ev: MouseEvent) {
	emit("click", ev);
}

const color = ref();

watch(
	() => props.user.avatarBlurhash,
	() => {
		color.value = extractAvgColorFromBlurhash(props.user.avatarBlurhash);
	},
	{
		immediate: true,
	},
);

const gallery = ref<HTMLElement | null>(null);

onMounted(() => {
	const lightbox = new PhotoSwipeLightbox({
		dataSource: [
			{
				src: url.value,
				w: 300,
				h: 300,
			},
		],
		gallery: gallery.value || undefined,
		children: ".avatar",
		thumbSelector: ".avatar",
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
		itemData.src = url.value;
		itemData.msrc = url.value;
		const wh = Math.max(
			300,
			Math.min(window.innerWidth, window.innerHeight) * 0.7,
		);
		itemData.h = wh;
		itemData.w = wh;
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
</script>

<style lang="scss" scoped>
@keyframes earwiggleleft {
	0% {
		transform: rotate(37.6deg) skew(30deg);
	}
	25% {
		transform: rotate(10deg) skew(30deg);
	}
	50% {
		transform: rotate(20deg) skew(30deg);
	}
	75% {
		transform: rotate(0deg) skew(30deg);
	}
	100% {
		transform: rotate(37.6deg) skew(30deg);
	}
}

@keyframes earwiggleright {
	0% {
		transform: rotate(-37.6deg) skew(-30deg);
	}
	30% {
		transform: rotate(-10deg) skew(-30deg);
	}
	55% {
		transform: rotate(-20deg) skew(-30deg);
	}
	75% {
		transform: rotate(0deg) skew(-30deg);
	}
	100% {
		transform: rotate(-37.6deg) skew(-30deg);
	}
}

.eiwwqkts {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	flex-shrink: 0;
	border-radius: 100%;
	line-height: 16px;

	&.showLightBox {
		cursor: zoom-in;
	}

	> .inner {
		position: absolute;
		inset: 0;
		border-radius: 100%;
		z-index: 1;
		overflow: hidden;
		object-fit: cover;
		inline-size: 100%;
		block-size: 100%;
	}

	> .indicator {
		position: absolute;
		z-index: 1;
		inset-block-end: 0;
		inset-inline-start: 0;
		inline-size: 18%;
		block-size: 18%;
	}

	&.square {
		border-radius: 20%;

		> .inner {
			border-radius: 20%;
		}
	}

	&.cat {
		&:before,
		&:after {
			background: #ebbcba;
			border: solid 4px currentColor;
			box-sizing: border-box;
			content: "";
			display: inline-block;
			block-size: 50%;
			inline-size: 50%;
			position: absolute;
			top: 0;  // Cat ear positions are irrelevant to text flow direction
		}

		&:before {
			border-radius: 25% 75% 75%;
			transform: rotate(37.5deg) skew(30deg);
			left: 0;  // Cat ear positions are irrelevant to text flow direction
		}

		&:after {
			border-radius: 75% 25% 75% 75%;
			transform: rotate(-37.5deg) skew(-30deg);
			right: 0;  // Cat ear positions are irrelevant to text flow direction
		}

		&:hover {
			&:before {
				animation: earwiggleleft 1s infinite;
			}

			&:after {
				animation: earwiggleright 1s infinite;
			}
		}
	}
}
</style>
