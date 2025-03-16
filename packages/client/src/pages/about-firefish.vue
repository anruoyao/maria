<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<div style="overflow: clip">
			<MkSpacer :content-max="600" :margin-min="20">
				<div class="_formRoot znqjceqz">
					<div id="debug"></div>
					<div
						ref="containerEl"
						v-panel
						class="_formBlock about"
						:class="{ playing: easterEggEngine != null }"
					>
						<img
							src="/client-assets/about-icon.png"
							alt=""
							class="icon"
							draggable="false"
							@load="iconLoaded"
							@click="gravity"
						/>
						<div class="misskey">Firefish</div>
						<div class="version">v{{ version }}</div>
						<span
							v-for="emoji in easterEggEmojis"
							:key="emoji.id"
							class="emoji"
							:data-physics-x="emoji.left"
							:data-physics-y="emoji.top"
							:class="{
								_physics_circle_: !emoji.emoji.startsWith(':'),
							}"
							><MkEmoji
								class="emoji"
								:emoji="emoji.emoji"
								:custom-emojis="instanceEmojis"
								:is-reaction="false"
								:normal="true"
								:no-style="true"
						/></span>
					</div>
					<div class="_formBlock" style="text-align: center">
						<MkButton primary rounded inline @click="iLoveMisskey"
							>I <Mfm text="$[jelly ❤]" /> #Firefish</MkButton
						>
					</div>
					<FormSection>
						<div class="_formLinks">
							<FormLink
								to="https://codeberg.org/firefish/firefish"
								external
							>
								<template #icon
									><i :class="icon('ph-code')"></i
								></template>
								{{ i18n.ts._aboutFirefish.source }}
								<template #suffix>Source Code</template>
							</FormLink>
							<FormLink
								to="https://hosted.weblate.org/engage/firefish/"
								external
							>
								<template #icon
									><i :class="icon('ph-translate')"></i
								></template>
								{{ i18n.ts._aboutFirefish.translation }}
								<template #suffix>Translate</template>
							</FormLink>
						</div>
					</FormSection>
				</div>
			</MkSpacer>
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { version } from "@/config";
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import MkButton from "@/components/MkButton.vue";
import { physics } from "@/scripts/physics";
import { i18n } from "@/i18n";
import { defaultReactions, defaultStore } from "@/store";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";
import { getInstanceInfo } from "@/instance";

let easterEggReady = false;
const easterEggEmojis = ref([]);
const easterEggEngine = ref(null);
const containerEl = ref<HTMLElement>();
const instanceEmojis = getInstanceInfo().emojis;

function iconLoaded() {
	const emojis =
		defaultStore.state.reactions.length > 0
			? defaultStore.state.reactions
			: defaultReactions;
	const containerWidth = containerEl.value?.offsetWidth;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.value.push({
			id: i.toString(),
			top: -(128 + Math.random() * 256),
			left: Math.random() * containerWidth,
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	nextTick(() => {
		easterEggReady = true;
	});
}

function gravity() {
	if (!easterEggReady) return;
	easterEggReady = false;
	easterEggEngine.value = physics(containerEl.value);
}

function iLoveMisskey() {
	os.post({
		initialText: "I $[jelly ❤] #Firefish",
		instant: true,
	});
}

onBeforeUnmount(() => {
	if (easterEggEngine.value) {
		easterEggEngine.value.stop();
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.aboutFirefish,
	icon: null,
});
</script>

<style lang="scss" scoped>
.znqjceqz {
	> .about {
		position: relative;
		text-align: center;
		padding: 16px;
		border-radius: var(--radius);

		&.playing {
			&,
			* {
				user-select: none;
			}

			* {
				will-change: transform;
			}

			> .emoji {
				visibility: visible;
			}
		}

		> .icon {
			display: block;
			inline-size: 100px;
			margin-block: 0;
			margin-inline: auto;
			border-radius: 3px;
		}

		> .misskey {
			margin-block-start: 0.75em;
			margin-inline-end: auto;
			margin-block-end: 0;
			margin-inline-start: auto;
			inline-size: max-content;
		}

		> .version {
			margin-block: 0;
			margin-inline: auto;
			inline-size: max-content;
			opacity: 0.5;
		}

		> .emoji {
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: 0;
			visibility: hidden;

			> .emoji {
				pointer-events: none;
				font-size: 24px;
				inline-size: 24px;
			}
		}
	}
}
</style>
