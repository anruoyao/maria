<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="700">
			<div class="_formRoot">
				<MkInput v-model="name" class="_formBlock">
					<template #label>{{ i18n.ts.name }}</template>
				</MkInput>

				<MkTextarea v-model="description" class="_formBlock">
					<template #label>{{ i18n.ts.description }}</template>
				</MkTextarea>

				<div class="banner">
					<MkButton v-if="bannerId == null" @click="setBannerImage"
						><i :class="icon('ph-plus')"></i>
						{{ i18n.ts._channel.setBanner }}</MkButton
					>
					<div v-else-if="bannerUrl">
						<img :src="bannerUrl" style="inline-size: 100%" />
						<MkButton @click="removeBannerImage()"
							><i :class="icon('ph-trash')"></i>
							{{ i18n.ts._channel.removeBanner }}</MkButton
						>
					</div>
				</div>
				<div class="_formBlock">
					<MkButton primary @click="save()"
						><i :class="icon('ph-floppy-disk-back')"></i>
						{{
							channelId ? i18n.ts.save : i18n.ts.create
						}}</MkButton
					>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { entities } from "firefish-js";
import MkTextarea from "@/components/form/textarea.vue";
import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/form/input.vue";
import { selectFile } from "@/scripts/select-file";
import * as os from "@/os";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const router = useRouter();

const props = defineProps<{
	channelId?: string;
}>();

const channel = ref<entities.Channel | null>(null);
const name = ref<string>("");
const description = ref<string>("");
const bannerUrl = ref<string | null>(null);
const bannerId = ref<string | null>(null);

let bannerUrlUpdated = false;

/**
 * Set banner url and id when we already know the url
 * Prevent redundant network requests from being sent
 */
function setBanner(opt: { bannerId: string | null; bannerUrl: string | null }) {
	bannerUrlUpdated = true;
	bannerUrl.value = opt.bannerUrl;
	bannerId.value = opt.bannerId;
	bannerUrlUpdated = false;
}

async function fetchChannel() {
	if (props.channelId == null) return;

	channel.value = await os.api("channels/show", {
		channelId: props.channelId,
	});

	name.value = channel.value.name;
	description.value = channel.value.description ?? "";
	setBanner(channel.value);
}

await fetchChannel();

watch(bannerId, async () => {
	if (bannerUrlUpdated) {
		bannerUrlUpdated = false;
		return;
	}
	if (bannerId.value == null) {
		bannerUrl.value = null;
	} else {
		bannerUrl.value = (
			await os.api("drive/files/show", {
				fileId: bannerId.value,
			})
		).url;
	}
});

function save() {
	const params: {
		name: string;
		description: string;
		bannerId: string | null;
	} = {
		name: name.value,
		description: description.value,
		bannerId: bannerId.value,
	};

	if (props.channelId) {
		os.api("channels/update", {
			...params,
			channelId: props.channelId,
		}).then(() => {
			os.success();
		});
	} else {
		os.api("channels/create", params).then((created) => {
			os.success();
			router.push(`/channels/${created.id}`);
		});
	}
}

function setBannerImage(evt: MouseEvent) {
	selectFile(evt.currentTarget ?? evt.target, null).then((file) => {
		setBanner({
			bannerId: file.id,
			bannerUrl: file.url,
		});
	});
}

function removeBannerImage() {
	setBanner({
		bannerId: null,
		bannerUrl: null,
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		props.channelId
			? {
					title: i18n.ts._channel.edit,
					icon: `${icon("ph-television")}`,
				}
			: {
					title: i18n.ts._channel.create,
					icon: `${icon("ph-television")}`,
				},
	),
);
</script>
