<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
		/></template>
		<MkSpacer
			v-if="instance"
			:content-max="600"
			:margin-min="16"
			:margin-max="32"
		>
			<swiper
				:round-lengths="true"
				:touch-angle="25"
				:threshold="10"
				:centered-slides="true"
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="
					defaultStore.state.swipeOnMobile &&
					(deviceKind !== 'desktop' ||
						defaultStore.state.swipeOnDesktop)
				"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<div class="_formRoot">
						<div class="fnfelxur">
							<img :src="iconUrl" alt="" class="icon" />
							<span class="name">{{
								instance.name || `(${i18n.ts.unknown})`
							}}</span>
						</div>
						<MkKeyValue :copy="host" oneline style="margin: 1em 0">
							<template #key>Host</template>
							<template #value
								><span class="_monospace"
									><MkLink :url="`https://${host}`">{{
										host
									}}</MkLink></span
								></template
							>
						</MkKeyValue>
						<MkKeyValue oneline style="margin: 1em 0">
							<template #key>{{ i18n.ts.software }}</template>
							<template #value
								><span class="_monospace"
									>{{
										instance.softwareName ||
										`(${i18n.ts.unknown})`
									}}
									/
									{{
										instance.softwareVersion ||
										`(${i18n.ts.unknown})`
									}}</span
								></template
							>
						</MkKeyValue>
						<MkKeyValue oneline style="margin: 1em 0">
							<template #key>{{
								i18n.ts.administrator
							}}</template>
							<template #value
								>{{
									instance.maintainerName ||
									`(${i18n.ts.unknown})`
								}}
								({{
									instance.maintainerEmail ||
									`(${i18n.ts.unknown})`
								}})</template
							>
						</MkKeyValue>
						<MkKeyValue>
							<template #key>{{ i18n.ts.description }}</template>
							<template #value>{{
								instance.description
							}}</template>
						</MkKeyValue>

						<FormSection v-if="isAdmin">
							<template #label>Moderation</template>
							<FormSuspense :p="init">
								<FormSwitch
									v-model="suspended"
									class="_formBlock"
									@update:modelValue="toggleSuspend"
									>{{
										i18n.ts.stopActivityDelivery
									}}</FormSwitch
								>
								<FormSwitch
									v-model="isBlocked"
									class="_formBlock"
									@update:modelValue="toggleBlock"
									>{{ i18n.ts.blockThisInstance }}</FormSwitch
								>
								<FormSwitch
									v-model="isSilenced"
									class="_formBlock"
									@update:modelValue="toggleSilence"
									>{{
										i18n.ts.silenceThisInstance
									}}</FormSwitch
								>
							</FormSuspense>
							<MkButton @click="refreshMetadata"
								><i :class="icon('ph-arrows-clockwise')"></i>
								Refresh metadata</MkButton
							>
						</FormSection>

						<FormSection>
							<MkKeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.registeredAt
								}}</template>
								<template #value
									><MkTime
										mode="detail"
										:time="instance.caughtAt"
								/></template>
							</MkKeyValue>
							<MkKeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.updatedAt
								}}</template>
								<template #value
									><MkTime
										mode="detail"
										:time="instance.infoUpdatedAt"
								/></template>
							</MkKeyValue>
							<MkKeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.latestRequestSentAt
								}}</template>
								<template #value
									><MkTime
										v-if="instance.latestRequestSentAt"
										:time="instance.latestRequestSentAt"
									/><span v-else>N/A</span></template
								>
							</MkKeyValue>
							<MkKeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.latestStatus
								}}</template>
								<template #value>{{
									instance.latestStatus
										? instance.latestStatus
										: "N/A"
								}}</template>
							</MkKeyValue>
							<MkKeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.latestRequestReceivedAt
								}}</template>
								<template #value
									><MkTime
										v-if="instance.latestRequestReceivedAt"
										:time="instance.latestRequestReceivedAt"
									/><span v-else>N/A</span></template
								>
							</MkKeyValue>
						</FormSection>

						<FormSection>
							<MkKeyValue oneline style="margin: 1em 0">
								<template #key>Following (Pub)</template>
								<template #value>{{
									number(instance.followingCount)
								}}</template>
							</MkKeyValue>
							<MkKeyValue oneline style="margin: 1em 0">
								<template #key>Followers (Sub)</template>
								<template #value>{{
									number(instance.followersCount)
								}}</template>
							</MkKeyValue>
						</FormSection>

						<FormSection>
							<template #label>Well-known resources</template>
							<FormLink
								:to="`https://${host}/.well-known/host-meta`"
								external
								style="margin-block-end: 8px"
								>host-meta</FormLink
							>
							<FormLink
								:to="`https://${host}/.well-known/host-meta.json`"
								external
								style="margin-block-end: 8px"
								>host-meta.json</FormLink
							>
							<FormLink
								:to="`https://${host}/.well-known/nodeinfo`"
								external
								style="margin-block-end: 8px"
								>nodeinfo</FormLink
							>
							<FormLink
								:to="`https://${host}/robots.txt`"
								external
								style="margin-block-end: 8px"
								>robots.txt</FormLink
							>
							<FormLink
								:to="`https://${host}/manifest.json`"
								external
								style="margin-block-end: 8px"
								>manifest.json</FormLink
							>
						</FormSection>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_formRoot">
						<MkPagination
							v-slot="{ items }"
							:pagination="usersPagination"
							style="
								display: grid;
								grid-template-columns: repeat(
									auto-fill,
									minmax(270px, 1fr)
								);
								grid-gap: 12px;
							"
						>
							<MkA
								v-for="user in items"
								:key="user.id"
								v-tooltip.mfm="
									`Last posted: ${new Date(
										user.updatedAt,
									).toLocaleString()}`
								"
								class="user"
								:to="`/user-info/${user.id}`"
							>
								<MkUserCardMini :user="user" />
							</MkA>
						</MkPagination>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_formRoot">
						<MkObjectView tall :value="instance"> </MkObjectView>
					</div>
				</swiper-slide>
			</swiper>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import type { entities } from "firefish-js";
import MkObjectView from "@/components/MkObjectView.vue";
import FormLink from "@/components/form/link.vue";
import MkLink from "@/components/MkLink.vue";
import MkButton from "@/components/MkButton.vue";
import FormSection from "@/components/form/section.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import FormSwitch from "@/components/form/switch.vue";
import * as os from "@/os";
import number from "@/filters/number";
import { isAdmin } from "@/me";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import MkUserCardMini from "@/components/MkUserCardMini.vue";
import MkPagination from "@/components/MkPagination.vue";
import { getProxiedImageUrlNullable } from "@/scripts/media-proxy";
import icon from "@/scripts/icon";
import "swiper/scss";
import "swiper/scss/virtual";

type AugmentedInstanceMetadata = entities.DetailedInstanceMetadata & {
	blockedHosts: string[];
	silencedHosts: string[];
};
type AugmentedInstance = entities.Instance & {
	isBlocked: boolean;
	isSilenced: boolean;
};

const props = defineProps<{
	host: string;
}>();

const tabs = ["overview"];
if (isAdmin) tabs.push("users", "raw");
const tab = ref(tabs[0]);
watch(tab, () => syncSlide(tabs.indexOf(tab.value)));

const meta = ref<AugmentedInstanceMetadata | null>(null);
const instance = ref<AugmentedInstance | null>(null);
const suspended = ref(false);
const isBlocked = ref(false);
const isSilenced = ref(false);
const iconUrl = ref<string | null>(null);

const usersPagination = {
	endpoint: isAdmin ? ("admin/show-users" as const) : ("users" as const),
	limit: 10,
	params: {
		sort: "+updatedAt",
		state: "all",
		hostname: props.host,
	},
	offsetMode: true,
};

async function fetch() {
	if (isAdmin)
		meta.value = (await os.api("admin/meta")) as AugmentedInstanceMetadata;
	instance.value = (await os.api("federation/show-instance", {
		host: props.host,
	})) as AugmentedInstance;
	suspended.value = instance.value.isSuspended;
	isBlocked.value = instance.value.isBlocked;
	isSilenced.value = instance.value.isSilenced;
	iconUrl.value =
		getProxiedImageUrlNullable(instance.value.iconUrl, "preview") ??
		getProxiedImageUrlNullable(instance.value.faviconUrl, "preview");
}

async function toggleBlock() {
	if (meta.value == null) return;
	if (!instance.value) {
		throw new Error(`Instance info not loaded`);
	}
	let blockedHosts: string[];
	if (isBlocked.value) {
		blockedHosts = meta.value.blockedHosts.concat([instance.value.host]);
	} else {
		blockedHosts = meta.value.blockedHosts.filter(
			(x) => x !== instance.value!.host,
		);
	}
	await os.api("admin/update-meta", {
		blockedHosts,
	});
}

async function toggleSilence() {
	if (meta.value == null) return;
	if (!instance.value) {
		throw new Error(`Instance info not loaded`);
	}
	let silencedHosts: string[];
	if (isSilenced.value) {
		silencedHosts = meta.value.silencedHosts.concat([instance.value.host]);
	} else {
		silencedHosts = meta.value.silencedHosts.filter(
			(x) => x !== instance.value!.host,
		);
	}
	await os.api("admin/update-meta", {
		silencedHosts,
	});
}

async function toggleSuspend(v) {
	await os.api("admin/federation/update-instance", {
		host: instance.value.host,
		isSuspended: suspended.value,
	});
}

function refreshMetadata() {
	os.api("admin/federation/refresh-remote-instance-metadata", {
		host: instance.value.host,
	});
	os.alert({
		text: "Refresh requested",
	});
}

fetch();

const headerActions = computed(() => [
	{
		text: `https://${props.host}`,
		icon: `${icon("ph-arrow-square-out")}`,
		handler: () => {
			window.open(`https://${props.host}`, "_blank");
		},
	},
]);

const theTabs = [
	{
		key: "overview",
		title: i18n.ts.overview,
		icon: `${icon("ph-info")}`,
	},
];

if (isAdmin) {
	theTabs.push(
		{
			key: "users",
			title: i18n.ts.users,
			icon: `${icon("ph-users")}`,
		},
		{
			key: "raw",
			title: "Raw",
			icon: `${icon("ph-code")}`,
		},
	);
}

const headerTabs = computed(() => theTabs);

definePageMetadata({
	title: props.host,
	icon: `${icon("ph-hard-drives")}`,
});

let swiperRef = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(tabs.indexOf(tab.value));
	const styles = getComputedStyle(swiper.el);
	swiper.changeLanguageDirection(styles.direction as "rtl" | "ltr");
	if (styles["writing-mode"].startsWith("vertical")) {
		swiper.changeDirection("vertical");
	}
}

function onSlideChange() {
	tab.value = tabs[swiperRef.activeIndex];
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}
</script>

<style lang="scss" scoped>
.fnfelxur {
	display: flex;
	align-items: center;

	> .icon {
		display: block;
		margin-block-start: 0;
		margin-inline-end: 16px;
		margin-block-end: 0;
		margin-inline-start: 0;
		block-size: 64px;
		border-radius: 8px;
	}

	> .name {
		word-break: break-all;
	}
}

.cmhjzshl {
	> .selects {
		display: flex;
		margin-block-start: 0;
		margin-inline-end: 0;
		margin-block-end: 16px;
		margin-inline-start: 0;
	}
}
</style>
