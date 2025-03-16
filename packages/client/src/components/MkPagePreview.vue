<template>
	<MkA
		:to="`/@${page.user.username}/pages/${page.name}`"
		class="vhpxefrj _block"
		tabindex="-1"
		:behavior="ui === 'deck' ? 'window' : null"
	>
		<div
			v-if="page.eyeCatchingImage"
			class="thumbnail"
			:style="`background-image: url('${page.eyeCatchingImage.thumbnailUrl}')`"
		></div>
		<article>
			<header>
				<h1 :title="page.title">{{ page.title }}</h1>
			</header>
			<p v-if="page.summary" :title="page.summary">
				{{
					page.summary.length > 85
						? page.summary.slice(0, 85) + "…"
						: page.summary
				}}
			</p>
			<footer>
				<img
					class="icon"
					:src="page.user.avatarUrl"
					aria-label="none"
				/>
				<p>{{ userName(page.user) }}</p>
			</footer>
		</article>
	</MkA>
</template>

<script lang="ts" setup>
import type { entities } from "firefish-js";
import { userName } from "@/filters/user";
import { ui } from "@/config";

defineProps<{
	page: entities.Page;
}>();
</script>

<style lang="scss" scoped>
.vhpxefrj {
	display: block;

	&:hover {
		text-decoration: none;
		color: var(--accent);
	}

	> .thumbnail {
		inline-size: 100%;
		block-size: 200px;
		background-position: center;
		background-size: cover;
		display: flex;
		justify-content: center;
		align-items: center;

		> button {
			font-size: 3.5em;
			opacity: 0.7;

			&:hover {
				font-size: 4em;
				opacity: 0.9;
			}
		}

		& + article {
			inset-inline-start: 100px;
			inline-size: calc(100% - 100px);
		}
	}

	> article {
		padding: 16px;

		> header {
			margin-block-end: 8px;

			> h1 {
				margin: 0;
				font-size: 1em;
				color: var(--urlPreviewTitle);
			}
		}

		> p {
			margin: 0;
			color: var(--urlPreviewText);
			font-size: 0.8em;
		}

		> footer {
			margin-block-start: 8px;
			block-size: 16px;

			> img {
				display: inline-block;
				inline-size: 16px;
				block-size: 16px;
				margin-inline-end: 4px;
				vertical-align: top;
			}

			> p {
				display: inline-block;
				margin: 0;
				color: var(--urlPreviewInfo);
				font-size: 0.8em;
				line-height: 16px;
				vertical-align: top;
			}
		}
	}

	@media (max-inline-size: 700px) {
		> .thumbnail {
			position: relative;
			inline-size: 100%;
			block-size: 100px;

			& + article {
				inset-inline-start: 0;
				inline-size: 100%;
			}
		}
	}

	@media (max-inline-size: 550px) {
		font-size: 12px;

		> .thumbnail {
			block-size: 80px;
		}

		> article {
			padding: 12px;
		}
	}

	@media (max-inline-size: 500px) {
		font-size: 10px;

		> .thumbnail {
			block-size: 70px;
		}

		> article {
			padding: 8px;

			> header {
				margin-block-end: 4px;
			}

			> footer {
				margin-block-start: 4px;

				> img {
					inline-size: 12px;
					block-size: 12px;
				}
			}
		}
	}
}
</style>
