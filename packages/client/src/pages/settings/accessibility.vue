<template>
	<div class="_formRoot">
		<FormSection>
			<FormSwitch v-model="showNoAltTextWarning" class="_formBlock">{{
				i18n.ts.showNoAltTextWarning
			}}</FormSwitch>
			<FormSwitch v-if="showNoAltTextWarning" v-model="showAddFileDescriptionAtFirstPost" class="_formBlock">{{
				i18n.ts.showAddFileDescriptionAtFirstPost
			}}</FormSwitch>
			<FormSwitch v-model="addAlt4MeTag" class="_formBlock">{{
				i18n.ts.addAlt4MeTag
			}}</FormSwitch>
			<FormSwitch v-model="expandOnNoteClick" class="_formBlock"
				>{{ i18n.ts.expandOnNoteClick
				}}<template #caption>{{
					i18n.ts.expandOnNoteClickDesc
				}}</template>
			</FormSwitch>
			<FormSwitch v-model="turnOffCatLanguage" @update:modelValue="save()" class="_formBlock"
				>{{ i18n.ts.turnOffCatLanguage }}<template #caption>{{
					i18n.ts.reflectMayTakeTime
				}}</template>
			</FormSwitch>
			<FormSwitch v-model="advancedMfm" class="_formBlock">
				{{ i18n.ts._mfm.advanced
				}}<template #caption>{{
					i18n.ts._mfm.advancedDescription
				}}</template>
			</FormSwitch>
			<FormSwitch v-model="autoplayMfm" class="_formBlock">
				{{ i18n.ts._mfm.alwaysPlay }}
				<template #caption>
					<i
						:class="icon('ph-warning')"
						style="color: var(--warn)"
					></i>
					{{ i18n.ts._mfm.warn }}
				</template>
			</FormSwitch>
			<FormSwitch v-model="reduceAnimation" class="_formBlock">{{
				i18n.ts.reduceUiAnimation
			}}</FormSwitch>
			<FormSwitch
				v-model="disableShowingAnimatedImages"
				class="_formBlock"
				>{{ i18n.ts.disableShowingAnimatedImages }}</FormSwitch
			>
			<FormSwitch v-model="useSystemFont" class="_formBlock">{{
				i18n.ts.useSystemFont
			}}</FormSwitch>
			<FormSwitch v-model="useOsNativeEmojis" class="_formBlock">
				{{ i18n.ts.useOsNativeEmojis }}
				<div>
					<Mfm :key="useOsNativeEmojis" text="🍮🍦🍭🍩🍰🍫🍬🥞🍪" />
				</div>
			</FormSwitch>
			<FormSwitch
				v-model="vibrate"
				class="_formBlock"
				@click="demoVibrate"
				>{{ i18n.ts.vibrate }}
			</FormSwitch>
			<FormRadios v-model="fontSize" class="_formBlock">
				<template #label>{{ i18n.ts.fontSize }}</template>
				<option :value="null">
					<span style="font-size: 14px">14</span>
				</option>
				<option value="15">
					<span style="font-size: 15px">15</span>
				</option>
				<option value="16">
					<span style="font-size: 16px">16</span>
				</option>
				<option value="17">
					<span style="font-size: 17px">17</span>
				</option>
				<option value="18">
					<span style="font-size: 18px">18</span>
				</option>
			</FormRadios>

			<!-- <FormRange
				v-model="fontSize"
				:min="12"
				:max="18"
				:step="1"
				:value="fontSize ? fontSize : 14"
				easing
				:showTicks="true"
				class="_formBlock"
			>
				<template #label>{{ i18n.ts.fontSize }}</template>
			</FormRange> -->
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { me } from "@/me";
import FormSwitch from "@/components/form/switch.vue";
import FormRadios from "@/components/form/radios.vue";
import FormSection from "@/components/form/section.vue";
import { ColdDeviceStorage, defaultStore } from "@/store";
import * as os from "@/os";
import { unisonReload } from "@/scripts/unison-reload";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const fontSize = ref(localStorage.getItem("fontSize"));
const useSystemFont = ref(localStorage.getItem("useSystemFont") !== "f");
const turnOffCatLanguage = ref(!me?.readCatLanguage);

function save() {
	os.api("i/update", {
		readCatLanguage: !turnOffCatLanguage.value,
	});
}

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: "info",
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

function demoVibrate() {
	window.navigator.vibrate(100);
}

const reduceAnimation = computed(
	defaultStore.makeGetterSetter(
		"animation",
		(v) => !v,
		(v) => !v,
	),
);
const advancedMfm = computed(defaultStore.makeGetterSetter("advancedMfm"));
const autoplayMfm = computed(
	defaultStore.makeGetterSetter(
		"animatedMfm",
		(v) => !v,
		(v) => !v,
	),
);
const useOsNativeEmojis = computed(
	defaultStore.makeGetterSetter("useOsNativeEmojis"),
);
const disableShowingAnimatedImages = computed(
	defaultStore.makeGetterSetter("disableShowingAnimatedImages"),
);
const vibrate = computed(ColdDeviceStorage.makeGetterSetter("vibrate"));
const expandOnNoteClick = computed(
	defaultStore.makeGetterSetter("expandOnNoteClick"),
);
const showNoAltTextWarning = computed(
	defaultStore.makeGetterSetter("showNoAltTextWarning"),
);
const showAddFileDescriptionAtFirstPost = computed(
	defaultStore.makeGetterSetter("showAddFileDescriptionAtFirstPost"),
);
const addAlt4MeTag = computed(defaultStore.makeGetterSetter("addAlt4MeTag"));

watch(fontSize, () => {
	if (fontSize.value == null) {
		localStorage.removeItem("fontSize");
	} else {
		localStorage.setItem("fontSize", fontSize.value);
	}
});

watch(useSystemFont, () => {
	if (useSystemFont.value) {
		localStorage.setItem("useSystemFont", "t");
	} else {
		localStorage.setItem("useSystemFont", "f");
	}
});

watch(
	[fontSize, useSystemFont, advancedMfm, autoplayMfm, expandOnNoteClick],
	async () => {
		await reloadAsk();
	},
);

definePageMetadata({
	title: i18n.ts.accessibility,
	icon: `${icon("ph-person-arms-spread")}`,
});
</script>
