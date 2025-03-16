<template>
	<div class="_formRoot">
		<FormSelect v-model="lang" class="_formBlock">
			<template #label>{{ i18n.ts.uiLanguage }}</template>
			<option v-for="x in langs" :key="x[0]" :value="x[0]">
				{{ x[1] }}
			</option>
			<template #caption>
				<I18n :src="i18n.ts.i18nInfo" tag="span">
					<template #link>
						<MkLink
							url="https://hosted.weblate.org/engage/firefish/"
							>Weblate</MkLink
						>
					</template>
				</I18n>
				<I18n v-if="serverLang" :src="i18n.ts.i18nServerInfo" tag="span">
					<template #language><strong>{{ langs.find(a => a[0] === serverLang)?.[1] ?? serverLang }}</strong></template>
				</I18n>
				<button v-if="lang && lang !== serverLang" class="_textButton" @click="updateServerLang">
					{{i18n.t(serverLang ? "i18nServerChange" : "i18nServerSet", { language: langs.find(a => a[0] === lang)?.[1] ?? lang })}}
				</button>
			</template>
		</FormSelect>

		<FormSelect v-model="translateLang" class="_formBlock">
			<template #label>
				{{ i18n.ts.languageForTranslation }}
			</template>
			<option v-for="x in langs" :key="x[0]" :value="x[0]">
				{{ x[1] }}
			</option>
		</FormSelect>

		<FormRadios v-model="overridedDeviceKind" class="_formBlock">
			<template #label>{{ i18n.ts.overridedDeviceKind }}</template>
			<option :value="null">{{ i18n.ts.auto }}</option>
			<option value="smartphone">
				<i :class="icon('ph-device-mobile')" />
				{{ i18n.ts.smartphone }}
			</option>
			<option value="tablet">
				<i :class="icon('ph-device-tablet')" />
				{{ i18n.ts.tablet }}
			</option>
			<option value="desktop">
				<i :class="icon('ph-desktop')" />
				{{ i18n.ts.desktop }}
			</option>
		</FormRadios>

		<FormRadios v-model="iconSet" class="_formBlock">
			<template #label>{{ i18n.ts.iconSet }}</template>
			<option value="ph-bold" :aria-label="i18n.ts._iconSets.bold">
				<i class="ph-bold ph-2x ph-star"></i>
			</option>
			<option value="ph-duotone" :aria-label="i18n.ts._iconSets.duotone">
				<i class="ph-duotone ph-2x ph-star"></i>
			</option>
			<option value="ph-fill" :aria-label="i18n.ts._iconSets.fill">
				<i class="ph-fill ph-2x ph-star"></i>
			</option>
			<option value="ph" :aria-label="i18n.ts._iconSets.regular">
				<i class="ph ph-2x ph-star"></i>
			</option>
			<option value="ph-light" :aria-label="i18n.ts._iconSets.light">
				<i class="ph-light ph-2x ph-star"></i>
			</option>
		</FormRadios>

		<FormSection>
			<template #label>{{ i18n.ts.behavior }}</template>
			<FormSwitch v-model="imageNewTab" class="_formBlock">{{
				i18n.ts.openImageInNewTab
			}}</FormSwitch>
			<FormSwitch v-model="enableInfiniteScroll" class="_formBlock">{{
				i18n.ts.enableInfiniteScroll
			}}</FormSwitch>
			<FormSwitch
				v-model="useReactionPickerForContextMenu"
				class="_formBlock"
				>{{ i18n.ts.useReactionPickerForContextMenu }}</FormSwitch
			>
			<FormSwitch v-model="showPreviewByDefault" class="_formBlock">{{
				i18n.ts.showPreviewByDefault
			}}</FormSwitch>
			<FormSwitch
				v-if="deviceKind !== 'desktop'"
				v-model="swipeOnMobile"
				class="_formBlock"
				>{{ i18n.ts.swipeOnMobile }}</FormSwitch
			>
			<FormSwitch
				v-if="deviceKind === 'desktop'"
				v-model="swipeOnDesktop"
				class="_formBlock"
				>{{ i18n.ts.swipeOnDesktop }}</FormSwitch
			>
			<FormSwitch v-model="enterSendsMessage" class="_formBlock">{{
				i18n.ts.enterSendsMessage
			}}</FormSwitch>
			<FormSwitch v-model="disablePagesScript" class="_formBlock">{{
				i18n.ts.disablePagesScript
			}}</FormSwitch>
			<FormSwitch v-model="showTimelineReplies" class="_formBlock">{{
				i18n.ts.flagShowTimelineReplies
			}}</FormSwitch>
			<FormSwitch v-model="enableTimelineStreaming" class="_formBlock">{{
				i18n.ts.enableTimelineStreaming
			}}</FormSwitch>
			<!-- <FormSwitch
				v-model="me.injectFeaturedNote"
				class="_formBlock"
				@update:modelValue="onChangeInjectFeaturedNote"
			>
				{{ i18n.ts.showFeaturedNotesInTimeline }}
			</FormSwitch> -->
			<!-- <FormSwitch v-model="reportError" class="_formBlock"
				>{{ i18n.ts.sendErrorReports
				}}<template #caption>{{
					i18n.ts.sendErrorReportsDescription
				}}</template></FormSwitch
			> -->
			<FormSwitch v-model="detectPostLanguage" class="_formBlock">{{
				i18n.ts.detectPostLanguage
			}}</FormSwitch>
			<FormSwitch v-model="openServerInfo" class="_formBlock">{{
				i18n.ts.openServerInfo
			}}</FormSwitch>
			<FormSwitch v-model="autocorrectNoteLanguage" class="_formBlock">{{
				i18n.ts.autocorrectNoteLanguage
			}}</FormSwitch>

			<FormSwitch v-model="foldNotification" class="_formBlock">{{
				i18n.ts.foldNotification
			}}</FormSwitch>
			<FormSwitch v-model="mergeThreadInTimeline" class="_formBlock">{{
				i18n.ts.mergeThreadInTimeline
			}}</FormSwitch>
			<FormSwitch v-model="mergeRenotesInTimeline" class="_formBlock">{{
				i18n.ts.mergeRenotesInTimeline
			}}</FormSwitch>

			<FormSelect v-model="serverDisconnectedBehavior" class="_formBlock">
				<template #label>{{ i18n.ts.whenServerDisconnected }}</template>
				<option value="reload">
					{{ i18n.ts._serverDisconnectedBehavior.reload }}
				</option>
				<option value="dialog">
					{{ i18n.ts._serverDisconnectedBehavior.dialog }}
				</option>
				<option value="quiet">
					{{ i18n.ts._serverDisconnectedBehavior.quiet }}
				</option>
				<option value="nothing">
					{{ i18n.ts._serverDisconnectedBehavior.nothing }}
				</option>
			</FormSelect>

			<FormSelect v-model="searchURL" class="_formBlock">
				<template #label>{{ i18n.ts.searchEngine }}</template>
				<option value="https://duckduckgo.com/?q=">
					DuckDuckGo (duckduckgo.com)
				</option>
				<option value="https://searxng.site/?q=">
					SearXNG (searxng.site)
				</option>
				<option value="https://araa.extravi.dev/search?q=">
					Araa (araa.extravi.dev)
				</option>
				<option value="https://websurfx.pp.ua/search?q=">
					Websurfx (websurfx.pp.ua)
				</option>
				<option value="https://stract.com/search?q=">
					Stract (stract.com)
				</option>
				<option value="https://google.com/search?q=">
					Google Search (google.com)
				</option>
				<option value="">
					{{ i18n.ts.postSearch }}
				</option>
			</FormSelect>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts.appearance }}</template>
			<FormSwitch v-model="showAds" class="_formBlock">{{
				i18n.ts.showAds
			}}</FormSwitch>
			<FormSwitch v-model="useBlurEffect" class="_formBlock">{{
				i18n.ts.useBlurEffect
			}}</FormSwitch>
			<FormSwitch v-model="useBlurEffectForModal" class="_formBlock">{{
				i18n.ts.useBlurEffectForModal
			}}</FormSwitch>
			<FormSwitch
				v-model="showGapBetweenNotesInTimeline"
				class="_formBlock"
				>{{ i18n.ts.showGapBetweenNotesInTimeline }}</FormSwitch
			>
			<FormSwitch v-model="hideFollowButtons" class="_formBlock"
				>{{ i18n.ts.hideFollowButtons }}
			</FormSwitch>
			<FormSwitch v-model="loadRawImages" class="_formBlock">{{
				i18n.ts.loadRawImages
			}}</FormSwitch>
			<FormSwitch v-model="squareAvatars" class="_formBlock">{{
				i18n.ts.squareAvatars
			}}</FormSwitch>
			<FormSwitch v-model="squareCatAvatars" class="_formBlock">{{
				i18n.ts.squareCatAvatars
			}}</FormSwitch>
			<FormSwitch v-model="seperateRenoteQuote" class="_formBlock">{{
				i18n.ts.seperateRenoteQuote
			}}</FormSwitch>
			<FormSwitch v-model="disableDrawer" class="_formBlock">{{
				i18n.ts.disableDrawer
			}}</FormSwitch>
			<FormSwitch v-model="showUpdates" class="_formBlock">{{
				i18n.ts.showUpdates
			}}</FormSwitch>
			<FormSwitch v-model="showFixedPostForm" class="_formBlock">{{
				i18n.ts.showFixedPostForm
			}}</FormSwitch>
			<FormSwitch v-model="showBigPostButton" class="_formBlock">{{
				i18n.ts.showBigPostButton
			}}</FormSwitch>
			<FormSwitch v-model="useEmojiCdn" class="_formBlock"
				>{{ i18n.ts.useCdn
				}}<template #caption>{{
					i18n.ts.useCdnDescription
				}}</template></FormSwitch
			>
			<FormSwitch
				v-if="me?.isAdmin"
				v-model="showAdminUpdates"
				class="_formBlock"
				>{{ i18n.ts.showAdminUpdates }}</FormSwitch
			>
			<FormSelect v-model="instanceTicker" class="_formBlock">
				<template #label>{{ i18n.ts.instanceTicker }}</template>
				<option value="none">{{ i18n.ts._instanceTicker.none }}</option>
				<option value="remote">
					{{ i18n.ts._instanceTicker.remote }}
				</option>
				<option value="always">
					{{ i18n.ts._instanceTicker.always }}
				</option>
			</FormSelect>

			<FormSelect v-model="nsfw" class="_formBlock">
				<template #label>{{ i18n.ts.nsfw }}</template>
				<option value="force">{{ i18n.ts._nsfw.force }}</option>
				<option value="respect">{{ i18n.ts._nsfw.respect }}</option>
				<option value="ignore">{{ i18n.ts._nsfw.ignore }}</option>
			</FormSelect>

			<FormSelect v-model="writingMode" class="_formBlock">
				<template #label>{{ i18n.ts.writingMode }}</template>
				<option value="horizontal-tb">{{ i18n.ts._writingMode.horizontalTB }}</option>
				<option value="vertical-rl">{{ i18n.ts._writingMode.verticalRL }}</option>
				<option value="vertical-rl-upright">{{ i18n.ts._writingMode.verticalRLUpright }}</option>
				<option value="vertical-lr">{{ i18n.ts._writingMode.verticalLR }}</option>
				<option value="vertical-lr-upright">{{ i18n.ts._writingMode.verticalLRUpright }}</option>
			</FormSelect>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts.forMobile }}</template>
			<FormSwitch
				v-model="replaceChatButtonWithAccountButton"
				class="_formBlock"
				>{{ i18n.ts.replaceChatButtonWithAccountButton }}</FormSwitch
			>
			<FormSwitch
				v-model="replaceWidgetsButtonWithReloadButton"
				class="_formBlock"
				>{{ i18n.ts.replaceWidgetsButtonWithReloadButton }}</FormSwitch
			>
			<FormSwitch v-model="enablePullToRefresh" class="_formBlock">{{
				i18n.ts.enablePullToRefresh
			}}</FormSwitch>
			<FormRange
				v-if="enablePullToRefresh"
				v-model="pullToRefreshThreshold"
				:min="100"
				:max="300"
				:step="10"
				easing
				class="_formBlock"
			>
				<template #label>{{ i18n.ts.pullToRefreshThreshold }}</template>
			</FormRange>
		</FormSection>

		<FormRange
			v-model="numberOfPageCache"
			:min="1"
			:max="10"
			:step="1"
			easing
			class="_formBlock"
		>
			<template #label>{{ i18n.ts.numberOfPageCache }}</template>
			<template #caption>{{
				i18n.ts.numberOfPageCacheDescription
			}}</template>
		</FormRange>

		<FormLink to="/settings/deck" class="_formBlock">{{
			i18n.ts.deck
		}}</FormLink>

		<FormLink to="/settings/custom-katex-macro" class="_formBlock"
			><template #icon><i :class="icon('ph-radical')"></i></template
			>{{ i18n.ts.customKaTeXMacro }}</FormLink
		>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { me } from "@/me";
import FormSwitch from "@/components/form/switch.vue";
import FormSelect from "@/components/form/select.vue";
import FormRadios from "@/components/form/radios.vue";
import FormRange from "@/components/form/range.vue";
import FormSection from "@/components/form/section.vue";
import FormLink from "@/components/form/link.vue";
import MkLink from "@/components/MkLink.vue";
import { langs } from "@/config";
import { defaultStore } from "@/store";
import * as os from "@/os";
import { unisonReload } from "@/scripts/unison-reload";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import icon from "@/scripts/icon";

const lang = ref(localStorage.getItem("lang"));
const serverLang = ref(me?.lang);
const translateLang = ref(localStorage.getItem("translateLang"));

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: "info",
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

const overridedDeviceKind = computed(
	defaultStore.makeGetterSetter("overridedDeviceKind"),
);
const serverDisconnectedBehavior = computed(
	defaultStore.makeGetterSetter("serverDisconnectedBehavior"),
);
const useBlurEffectForModal = computed(
	defaultStore.makeGetterSetter("useBlurEffectForModal"),
);
const useBlurEffect = computed(defaultStore.makeGetterSetter("useBlurEffect"));
const showGapBetweenNotesInTimeline = computed(
	defaultStore.makeGetterSetter("showGapBetweenNotesInTimeline"),
);
const showAds = computed(defaultStore.makeGetterSetter("showAds"));
const disableDrawer = computed(defaultStore.makeGetterSetter("disableDrawer"));
const loadRawImages = computed(defaultStore.makeGetterSetter("loadRawImages"));
const imageNewTab = computed(defaultStore.makeGetterSetter("imageNewTab"));
const nsfw = computed(defaultStore.makeGetterSetter("nsfw"));
const disablePagesScript = computed(
	defaultStore.makeGetterSetter("disablePagesScript"),
);
const showFixedPostForm = computed(
	defaultStore.makeGetterSetter("showFixedPostForm"),
);
const numberOfPageCache = computed(
	defaultStore.makeGetterSetter("numberOfPageCache"),
);
const instanceTicker = computed(
	defaultStore.makeGetterSetter("instanceTicker"),
);
const enableInfiniteScroll = computed(
	defaultStore.makeGetterSetter("enableInfiniteScroll"),
);
const enterSendsMessage = computed(
	defaultStore.makeGetterSetter("enterSendsMessage"),
);
const useReactionPickerForContextMenu = computed(
	defaultStore.makeGetterSetter("useReactionPickerForContextMenu"),
);
const seperateRenoteQuote = computed(
	defaultStore.makeGetterSetter("seperateRenoteQuote"),
);
const squareAvatars = computed(defaultStore.makeGetterSetter("squareAvatars"));
const squareCatAvatars = computed(
	defaultStore.makeGetterSetter("squareCatAvatars"),
);
const showUpdates = computed(defaultStore.makeGetterSetter("showUpdates"));
const swipeOnDesktop = computed(
	defaultStore.makeGetterSetter("swipeOnDesktop"),
);
const swipeOnMobile = computed(defaultStore.makeGetterSetter("swipeOnMobile"));
const showAdminUpdates = computed(
	defaultStore.makeGetterSetter("showAdminUpdates"),
);
const showPreviewByDefault = computed(
	defaultStore.makeGetterSetter("showPreviewByDefault"),
);
const showTimelineReplies = computed(
	defaultStore.makeGetterSetter("showTimelineReplies"),
);
const hideFollowButtons = computed(
	defaultStore.makeGetterSetter("hideFollowButtons"),
);
const replaceChatButtonWithAccountButton = computed(
	defaultStore.makeGetterSetter("replaceChatButtonWithAccountButton"),
);
const replaceWidgetsButtonWithReloadButton = computed(
	defaultStore.makeGetterSetter("replaceWidgetsButtonWithReloadButton"),
);
const detectPostLanguage = computed(
	defaultStore.makeGetterSetter("detectPostLanguage"),
);
const openServerInfo = computed(
	defaultStore.makeGetterSetter("openServerInfo"),
);
const iconSet = computed(defaultStore.makeGetterSetter("iconSet"));
const useEmojiCdn = computed(defaultStore.makeGetterSetter("useEmojiCdn"));
const searchURL = computed(defaultStore.makeGetterSetter("searchURL"));
const showBigPostButton = computed(
	defaultStore.makeGetterSetter("showBigPostButton"),
);
const enableTimelineStreaming = computed(
	defaultStore.makeGetterSetter("enableTimelineStreaming"),
);
const enablePullToRefresh = computed(
	defaultStore.makeGetterSetter("enablePullToRefresh"),
);
const pullToRefreshThreshold = computed(
	defaultStore.makeGetterSetter("pullToRefreshThreshold"),
);
const autocorrectNoteLanguage = computed(
	defaultStore.makeGetterSetter("autocorrectNoteLanguage"),
);
const foldNotification = computed(
	defaultStore.makeGetterSetter("foldNotification"),
);
const mergeThreadInTimeline = computed(
	defaultStore.makeGetterSetter("mergeThreadInTimeline"),
);
const mergeRenotesInTimeline = computed(
	defaultStore.makeGetterSetter("mergeRenotesInTimeline"),
);
const writingMode = computed(defaultStore.makeGetterSetter("writingMode"));

// This feature (along with injectPromo) is currently disabled
// function onChangeInjectFeaturedNote(v) {
// 	os.api("i/update", {
// 		injectFeaturedNote: v,
// 	}).then((i) => {
// 		me!.injectFeaturedNote = i.injectFeaturedNote;
// 	});
// }

function updateServerLang() {
	os.api("i/update", {
		lang: lang.value,
	}).then((i) => {
		serverLang.value = i.lang;
	});
}

watch(swipeOnDesktop, () => {
	defaultStore.set("swipeOnMobile", true);
});

watch(iconSet, () => {
	defaultStore.set("iconSet", iconSet.value);
});

watch(lang, () => {
	localStorage.setItem("lang", lang.value as string);
	localStorage.removeItem("locale");
});

watch(translateLang, () => {
	localStorage.setItem("translateLang", translateLang.value as string);
});

watch(writingMode, () => {
	localStorage.setItem("writingMode", writingMode.value as string);
	const { classList } = document.documentElement;
	classList.remove("vertical-rl");
	classList.remove("vertical-lr");
	classList.remove("upright");
	if (writingMode.value.startsWith("vertical-rl")) {
		classList.add("vertical-rl");
	}
	if (writingMode.value.startsWith("vertical-lr")) {
		classList.add("vertical-lr");
	}
	if (writingMode.value.endsWith("upright")) {
		classList.add("upright");
	}
});

watch(
	[
		lang,
		translateLang,
		enableInfiniteScroll,
		squareAvatars,
		showGapBetweenNotesInTimeline,
		instanceTicker,
		overridedDeviceKind,
		showAds,
		showUpdates,
		swipeOnMobile,
		swipeOnDesktop,
		seperateRenoteQuote,
		showAdminUpdates,
		iconSet,
		useEmojiCdn,
		enableTimelineStreaming,
		enablePullToRefresh,
		pullToRefreshThreshold,
	],
	async () => {
		await reloadAsk();
	},
);

definePageMetadata({
	title: i18n.ts.general,
	icon: `${icon("ph-gear-six")}`,
});
</script>
