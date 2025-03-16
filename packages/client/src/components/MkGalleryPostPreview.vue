<template>
	<MkA :to="`/gallery/${post.id}`" class="ttasepnz _panel">
		<div class="thumbnail">
			<ImgWithBlurhash
				v-if="post.files && post.files.length > 0"
				class="img"
				:src="post.files[0].thumbnailUrl"
				:hash="post.files[0].blurhash"
			/>
			<div
				v-else
				class="_fullinfo"
			>
				<!-- If there is no picture
					This can happen if the user deletes the image in the drive
				-->
				<img
					src="/static-assets/badges/not-found.webp"
					class="img"
					:alt="i18n.ts.notFound"
				/>
			</div>
		</div>
		<article>
			<header>
				<MkAvatar :user="post.user" class="avatar" />
			</header>
			<footer>
				<span class="title">{{ post.title }}</span>
			</footer>
		</article>
	</MkA>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";
import ImgWithBlurhash from "@/components/MkImgWithBlurhash.vue";
import { i18n } from "@/i18n";

defineProps<{
	post: entities.GalleryPost;
}>();
</script>

<style lang="scss" scoped>
.ttasepnz {
	display: block;
	position: relative;
	block-size: 200px;

	&:hover,
	&:focus {
		text-decoration: none;
		color: var(--accent);

		> .thumbnail {
			transform: scale(1.1);
		}

		> article {
			> footer {
				&:before {
					opacity: 1;
				}
			}
		}
	}

	> .thumbnail {
		display: flex;
		inline-size: 100%;
		block-size: 100%;
		justify-content: center;
		align-items: center;
		position: absolute;
		transition: all 0.5s ease;

		> .img {
			position: relative;
			inline-size: 100%;
			block-size: 100%;
			object-fit: cover;
		}
	}

	> article {
		position: absolute;
		z-index: 1;
		inline-size: 100%;
		block-size: 100%;

		> header {
			position: absolute;
			inset-block-start: 0;
			inline-size: 100%;
			padding: 12px;
			box-sizing: border-box;
			display: flex;

			> .avatar {
				margin-inline-start: auto;
				inline-size: 32px;
				block-size: 32px;
			}
		}

		> footer {
			position: absolute;
			inset-block-end: 0;
			inline-size: 100%;
			padding: 16px;
			box-sizing: border-box;
			color: #fff;
			text-shadow: 0 0 8px var(--shadow);
			background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));

			&:before {
				content: "";
				display: block;
				position: absolute;
				z-index: -1;
				inset-block-start: 0;
				inset-inline-start: 0;
				inline-size: 100%;
				block-size: 100%;
				background: linear-gradient(rgba(0, 0, 0, 0.4), transparent);
				opacity: 0;
				transition: opacity 0.5s ease;
			}

			> .title {
				font-weight: bold;
			}
		}
	}
}
</style>
