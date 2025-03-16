<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
			/>
		</template>
		<div>
			<transition name="fade" mode="out-in">
				<div v-if="user">
					<XHome
						v-if="tab === 'home'"
						:user="user"
						@refresh="fetchUser()"
					/>
					<XReactions v-else-if="tab === 'reactions'" :user="user" />
					<XMediaList v-else-if="tab === 'media'" :user="user"/>
					<XClips v-else-if="tab === 'clips'" :user="user" />
					<XPages v-else-if="tab === 'pages'" :user="user" />
					<XGallery v-else-if="tab === 'gallery'" :user="user" />
				</div>
				<MkError v-else-if="error" @retry="fetchUser()" />
				<MkLoading v-else />
			</transition>
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { acct, type entities } from "firefish-js";
import * as os from "@/os";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import { isSignedIn, me } from "@/me";
import icon from "@/scripts/icon";

const XHome = defineAsyncComponent(() => import("./home.vue"));
const XReactions = defineAsyncComponent(() => import("./reactions.vue"));
const XMediaList = defineAsyncComponent(() => import("./media-list.vue"));
const XClips = defineAsyncComponent(() => import("./clips.vue"));
const XPages = defineAsyncComponent(() => import("./pages.vue"));
const XGallery = defineAsyncComponent(() => import("./gallery.vue"));

const props = withDefaults(
	defineProps<{
		acct: string;
		page?: "home" | "reactions" | "media" | "clips" | "pages" | "gallery";
	}>(),
	{
		page: "home",
	},
);

useRouter();

const tab = ref(props.page);
const user = ref<null | entities.UserDetailed>(null);
const error = ref(null);

function fetchUser(): void {
	if (props.acct == null) return;
	user.value = null;
	os.api("users/show", acct.parse(props.acct))
		.then((u) => {
			user.value = u;
		})
		.catch((err) => {
			error.value = err;
		});
}

watch(() => props.acct, fetchUser, {
	immediate: true,
});

const headerActions = computed(() => []);

const headerTabs = computed(() =>
	user.value
		? [
				{
					key: "home",
					title: i18n.ts.overview,
					icon: `${icon("ph-user")}`,
				},
				{
					key: "media",
					title: i18n.ts.media,
					icon: `${icon("ph-grid-four")}`,
				},
				...((isSignedIn(me) && me.id === user.value.id) ||
				user.value.publicReactions
					? [
							{
								key: "reactions",
								title: i18n.ts.reactions,
								icon: `${icon("ph-smiley")}`,
							},
						]
					: []),
				...(user.value.instance == null
					? [
							{
								key: "clips",
								title: i18n.ts.clips,
								icon: `${icon("ph-paperclip")}`,
							},
							{
								key: "pages",
								title: i18n.ts.pages,
								icon: `${icon("ph-file-text ph-dir")}`,
							},
							{
								key: "gallery",
								title: i18n.ts.gallery,
								icon: `${icon("ph-image-square")}`,
							},
						]
					: []),
			]
		: null,
);

definePageMetadata(
	computed(() =>
		user.value
			? {
					icon: `${icon("ph-user")}`,
					title: user.value.name
						? `${user.value.name} (@${user.value.username})`
						: `@${user.value.username}`,
					subtitle: `@${acct.toString(user.value)}`,
					userName: user.value,
					avatar: user.value,
					path: `/@${user.value.username}`,
					share: {
						title: user.value.name,
					},
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
</style>
