<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="700">
			<div v-if="channel">
				<div
					class="wpgynlbz _panel _gap"
					:class="{ hide: !showBanner }"
				>
					<XChannelFollowButton
						:channel="channel"
						:full="true"
						class="subscribe"
					/>
					<button
						class="_button toggle"
						@click="() => (showBanner = !showBanner)"
					>
						<template v-if="showBanner"
							><i :class="icon('ph-caret-up ph-dir')"></i
						></template>
						<template v-else
							><i :class="icon('ph-caret-down ph-dir')"></i
						></template>
					</button>
					<div v-if="!showBanner" class="hideOverlay"></div>
					<div
						:style="{
							backgroundImage: channel.bannerUrl
								? `url(${channel.bannerUrl})`
								: undefined,
						}"
						class="banner"
					>
						<div class="status">
							<div>
								<i :class="icon('ph-users ph-fw')"></i
								><I18n
									:src="i18n.ts._channel.usersCount"
									tag="span"
									style="margin-inline-start: 4px"
									><template #n
										><b>{{
											channel.usersCount
										}}</b></template
									></I18n
								>
							</div>
							<div>
								<i :class="icon('ph-pencil ph-fw')"></i
								><I18n
									:src="i18n.ts._channel.notesCount"
									tag="span"
									style="margin-inline-start: 4px"
									><template #n
										><b>{{
											channel.notesCount
										}}</b></template
									></I18n
								>
							</div>
						</div>
						<div class="fade"></div>
					</div>
					<div v-if="channel.description" class="description">
						<Mfm
							:text="channel.description"
							:is-note="false"
							:i="me"
						/>
					</div>
				</div>

				<XPostForm
					v-if="me"
					:channel="channel"
					class="post-form _panel _gap"
					fixed
				/>

				<XTimeline
					:key="channelId"
					class="_gap"
					src="channel"
					:channel="channelId"
				/>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { entities } from "firefish-js";
import XPostForm from "@/components/MkPostForm.vue";
import XTimeline from "@/components/MkTimeline.vue";
import XChannelFollowButton from "@/components/MkChannelFollowButton.vue";
import * as os from "@/os";
import { useRouter } from "@/router";
import { me } from "@/me";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const router = useRouter();

const props = defineProps<{
	channelId: string;
}>();

const channel = ref<entities.Channel>(
	await os.api("channels/show", {
		channelId: props.channelId,
	}),
);
const showBanner = ref(true);

watch(
	() => props.channelId,
	async () => {
		channel.value = await os.api("channels/show", {
			channelId: props.channelId,
		});
	},
);

function edit() {
	router.push(`/channels/${channel.value?.id}/edit`);
}

const headerActions = computed(() => [
	...(channel.value && channel.value?.userId === me?.id
		? [
				{
					icon: `${icon("ph-gear-six")}`,
					text: i18n.ts.toEdit,
					handler: edit,
				},
			]
		: []),
]);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		channel.value
			? {
					title: channel.value.name,
					icon: `${icon("ph-television")}`,
				}
			: null,
	),
);
</script>

<style lang="scss" scoped>
.wpgynlbz {
	position: relative;

	> .subscribe {
		position: absolute;
		z-index: 1;
		inset-block-start: 16px;
		inset-inline-start: 16px;
	}

	> .toggle {
		position: absolute;
		z-index: 2;
		inset-block-start: 8px;
		inset-inline-end: 8px;
		font-size: 1.2em;
		inline-size: 48px;
		block-size: 48px;
		color: #fff;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 100%;

		> i {
			vertical-align: middle;
		}
	}

	> .banner {
		position: relative;
		block-size: 200px;
		background-position: center;
		background-size: cover;

		> .fade {
			position: absolute;
			inset-block-end: 0;
			inset-inline-start: 0;
			inline-size: 100%;
			block-size: 64px;
			background: linear-gradient(var(--gradient-to-block-start), var(--panel), var(--X15));
		}

		> .status {
			position: absolute;
			z-index: 1;
			inset-block-end: 16px;
			inset-inline-end: 16px;
			padding-block: 8px;
			padding-inline: 12px;
			font-size: 80%;
			background: rgba(0, 0, 0, 0.7);
			border-radius: 6px;
			color: #fff;
		}
	}

	> .description {
		padding: 16px;
	}

	> .hideOverlay {
		position: absolute;
		z-index: 1;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 100%;
		block-size: 100%;
		-webkit-backdrop-filter: var(--blur, blur(16px));
		backdrop-filter: var(--blur, blur(16px));
		background: rgba(0, 0, 0, 0.3);
	}

	&.hide {
		> .subscribe {
			display: none;
		}

		> .toggle {
			inset-block-start: 0;
			inset-inline-end: 0;
			block-size: 100%;
			background: transparent;
		}

		> .banner {
			block-size: 42px;
			filter: blur(8px);

			> * {
				display: none;
			}
		}

		> .description {
			display: none;
		}
	}
}
</style>
