<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="1000" :margin-min="16" :margin-max="32">
			<div class="_root">
				<transition
					:name="defaultStore.state.animation ? 'fade' : ''"
					mode="out-in"
				>
					<div v-if="post" class="rkxwuolj">
						<div class="files">
							<div
								v-for="file in post.files"
								:key="file.id"
								class="file"
							>
								<img :src="file.url" />
							</div>
						</div>
						<div class="body _block">
							<div class="title">{{ post.title }}</div>
							<div class="description">
								<Mfm :text="post.description || ''" />
							</div>
							<div class="info">
								<i :class="icon('ph-clock')"></i>
								<MkTime :time="post.createdAt" mode="detail" />
							</div>
							<div class="actions">
								<div class="like">
									<MkButton
										v-if="post.isLiked"
										v-tooltip="i18n.ts._gallery.unlike"
										class="button"
										primary
										@click="unlike()"
										><i class="ph-heart ph-fill"></i
										><span
											v-if="post.likedCount > 0"
											class="count"
											>{{ post.likedCount }}</span
										></MkButton
									>
									<MkButton
										v-else
										v-tooltip="i18n.ts._gallery.like"
										class="button"
										@click="like()"
										><i :class="icon('ph-heart', false)"></i
										><span
											v-if="post.likedCount > 0"
											class="count"
											>{{ post.likedCount }}</span
										></MkButton
									>
								</div>
								<div class="other">
									<button
										v-if="
											isSignedIn(me) && me.id === post.user.id
										"
										v-tooltip="i18n.ts.toEdit"
										v-click-anime
										class="_button"
										@click="edit"
									>
										<i :class="icon('ph-pencil ph-fw')"></i>
									</button>
									<button
										v-tooltip="i18n.ts.shareWithNote"
										v-click-anime
										class="_button"
										@click="shareWithNote"
									>
										<i
											:class="
												icon('ph-rocket-launch ph-fw')
											"
										></i>
									</button>
									<button
										v-if="shareAvailable()"
										v-tooltip="i18n.ts.share"
										v-click-anime
										class="_button"
										@click="share"
									>
										<i
											:class="
												icon('ph-share-network ph-fw')
											"
										></i>
									</button>
								</div>
							</div>
							<div class="user">
								<MkAvatar :user="post.user" class="avatar" />
								<div class="name">
									<MkUserName
										:user="post.user"
										style="display: block"
									/>
									<MkAcct :user="post.user" />
								</div>
								<MkFollowButton
									v-if="!isSignedIn(me) || me.id != post.user.id"
									:user="post.user"
									:inline="true"
									:transparent="false"
									:full="true"
									large
									class="koudoku"
								/>
							</div>
						</div>
						<MkAd :prefer="['inline', 'inline-big']" />
						<MkContainer
							:max-height="300"
							:foldable="true"
							class="other"
						>
							<template #header
								><i :class="icon('ph-clock')"></i>
								{{ i18n.ts.recentPosts }}</template
							>
							<MkPagination
								v-slot="{ items }"
								:pagination="otherPostsPagination"
							>
								<div class="sdrarzaf">
									<MkGalleryPostPreview
										v-for="post in items"
										:key="post.id"
										:post="post"
										class="post"
									/>
								</div>
							</MkPagination>
						</MkContainer>
					</div>
					<MkError v-else-if="error" @retry="fetchPost()" />
					<MkLoading v-else />
				</transition>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { entities } from "firefish-js";
import MkButton from "@/components/MkButton.vue";
import * as os from "@/os";
import MkContainer from "@/components/MkContainer.vue";
import MkPagination from "@/components/MkPagination.vue";
import MkGalleryPostPreview from "@/components/MkGalleryPostPreview.vue";
import MkFollowButton from "@/components/MkFollowButton.vue";
import { url } from "@/config";
import { useRouter } from "@/router";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { shareAvailable } from "@/scripts/share-available";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";
import { isSignedIn, me } from "@/me";

const router = useRouter();

const props = defineProps<{
	postId: string;
}>();

const post = ref<entities.GalleryPost | null>(null);
const error = ref(null);
const otherPostsPagination = {
	endpoint: "users/gallery/posts" as const,
	limit: 6,
	params: computed(() => ({
		userId: post.value!.user.id,
	})),
};

function fetchPost() {
	post.value = null;
	error.value = null;
	os.api("gallery/posts/show", {
		postId: props.postId,
	})
		.then((_post) => {
			post.value = _post;
		})
		.catch((_error) => {
			error.value = _error;
		});
}

function share() {
	navigator.share({
		title: post.value!.title,
		text: post.value!.description || undefined,
		url: `${url}/gallery/${post.value!.id}`,
	});
}

function shareWithNote() {
	os.post({
		initialText: `${post.value!.title} ${url}/gallery/${post.value!.id}`,
	});
}

function like() {
	os.api("gallery/posts/like", {
		postId: props.postId,
	}).then(() => {
		post.value!.isLiked = true;
		post.value!.likedCount++;
	});
}

async function unlike() {
	os.api("gallery/posts/unlike", {
		postId: props.postId,
	}).then(() => {
		post.value!.isLiked = false;
		post.value!.likedCount--;
	});
}

function edit() {
	router.push(`/gallery/${post.value!.id}/edit`);
}

watch(() => props.postId, fetchPost, { immediate: true });

const headerActions = computed(() => []);
const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		post.value
			? {
					title: post.value.title,
					avatar: post.value.user,
				}
			: null,
	),
);
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.125s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.rkxwuolj {
	> .files {
		> .file {
			> img {
				display: block;
				max-inline-size: 100%;
				max-block-size: 500px;
				margin-block: 0;
				margin-inline: auto;
				border-radius: 10px;
			}

			& + .file {
				margin-block-start: 16px;
			}
		}
	}

	> .body {
		padding: 32px;

		> .title {
			font-weight: bold;
			font-size: 1.2em;
			margin-block-end: 16px;
		}

		> .info {
			margin-block-start: 16px;
			font-size: 90%;
			opacity: 0.7;
		}

		> .actions {
			display: flex;
			align-items: center;
			margin-block-start: 16px;
			padding-block-start: 16px;
			padding-inline-end: 0;
			padding-block-end: 0;
			padding-inline-start: 0;
			border-block-start: solid 0.5px var(--divider);

			> .like {
				> .button {
					--accent: #eb6f92;
					--X8: #eb6f92;
					--buttonBg: rgb(216 71 106 / 5%);
					--buttonHoverBg: rgb(216 71 106 / 10%);
					color: #eb6f92;

					::v-deep(.count) {
						margin-inline-start: 0.5em;
					}
				}
			}

			> .other {
				margin-inline-start: auto;

				> button {
					padding: 8px;
					margin-block: 0;
					margin-inline: 8px;

					&:hover {
						color: var(--fgHighlighted);
					}
				}
			}
		}

		> .user {
			margin-block-start: 16px;
			padding-block-start: 16px;
			padding-inline-end: 0;
			padding-block-end: 0;
			padding-inline-start: 0;
			border-block-start: solid 0.5px var(--divider);
			display: flex;
			align-items: center;

			> .avatar {
				inline-size: 52px;
				block-size: 52px;
			}

			> .name {
				margin-block-start: 0;
				margin-inline-end: 0;
				margin-block-end: 0;
				margin-inline-start: 12px;
				font-size: 90%;
			}

			> .koudoku {
				margin-inline-start: auto;
			}
		}
	}
}

.sdrarzaf {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	grid-gap: 12px;
	margin: var(--margin);
}
</style>
