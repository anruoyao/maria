<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
			<FormSuspense :p="init">
				<div class="_formRoot">
					<FormFolder class="_formBlock">
						<template #icon
							><i :class="icon('ph-robot')"></i
						></template>
						<template #label>{{ i18n.ts.botProtection }}</template>
						<template v-if="enableHcaptcha" #suffix
							>hCaptcha</template
						>
						<template v-else-if="enableRecaptcha" #suffix
							>reCAPTCHA</template
						>
						<template v-else #suffix
							>{{ i18n.ts.none }} ({{
								i18n.ts.notRecommended
							}})</template
						>

						<XBotProtection />
					</FormFolder>

					<FormFolder class="_formBlock">
						<template #label>Active Email Validation</template>
						<template v-if="enableActiveEmailValidation" #suffix
							>Enabled</template
						>
						<template v-else #suffix>Disabled</template>

						<div class="_formRoot">
							<span class="_formBlock">{{
								i18n.ts.activeEmailValidationDescription
							}}</span>
							<FormSwitch
								v-model="enableActiveEmailValidation"
								class="_formBlock"
								@update:modelValue="save"
							>
								<template #label>Enable</template>
							</FormSwitch>
						</div>
					</FormFolder>

					<FormFolder class="_formBlock">
						<template #label>Log IP address</template>
						<template v-if="enableIpLogging" #suffix
							>Enabled</template
						>
						<template v-else #suffix>Disabled</template>

						<div class="_formRoot">
							<FormSwitch
								v-model="enableIpLogging"
								class="_formBlock"
								@update:modelValue="save"
							>
								<template #label>Enable</template>
							</FormSwitch>
						</div>
					</FormFolder>

					<FormFolder class="_formBlock">
						<template #label>Summaly Proxy</template>

						<div class="_formRoot">
							<FormInput
								v-model="summalyProxy"
								class="_formBlock"
							>
								<template #prefix
									><i :class="icon('ph-link-simple')"></i
								></template>
								<template #label>Summaly Proxy URL</template>
							</FormInput>

							<FormButton primary class="_formBlock" @click="save"
								><i :class="icon('ph-floppy-disk-back')"></i>
								{{ i18n.ts.save }}</FormButton
							>
						</div>
					</FormFolder>

					<FormFolder class="_formBlock">
						<template #label>{{
							i18n.ts.instanceSecurity
						}}</template>

						<div class="_formRoot">
							<FormSwitch
								v-if="!privateMode"
								v-model="secureMode"
							>
								<template #label>{{
									i18n.ts.secureMode
								}}</template>
								<template #caption>{{
									i18n.ts.secureModeInfo
								}}</template>
							</FormSwitch>
							<FormSwitch v-model="privateMode">
								<template #label>{{
									i18n.ts.privateMode
								}}</template>
								<template #caption>{{
									i18n.ts.privateModeInfo
								}}</template>
							</FormSwitch>
							<FormTextarea
								v-if="privateMode"
								v-model="allowedHosts"
							>
								<template #label>{{
									i18n.ts.allowedInstances
								}}</template>
								<template #caption>{{
									i18n.ts.allowedInstancesDescription
								}}</template>
							</FormTextarea>
							<FormButton
								primary
								class="_formBlock"
								@click="saveInstance"
								><i :class="icon('ph-floppy-disk-back')"></i>
								{{ i18n.ts.save }}</FormButton
							>
						</div>
					</FormFolder>
				</div>
			</FormSuspense>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import XBotProtection from "./bot-protection.vue";
import FormFolder from "@/components/form/folder.vue";
import FormSwitch from "@/components/form/switch.vue";
import FormSuspense from "@/components/form/suspense.vue";
import FormInput from "@/components/form/input.vue";
import FormTextarea from "@/components/form/textarea.vue";
import FormButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { updateInstanceCache } from "@/instance";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const summalyProxy = ref("");
const enableHcaptcha = ref(false);
const enableRecaptcha = ref(false);
const enableIpLogging = ref(false);
const enableActiveEmailValidation = ref(false);

const secureMode = ref(false);
const privateMode = ref(false);
const allowedHosts = ref("");

async function init() {
	const meta = await os.api("admin/meta");
	summalyProxy.value = meta?.summalyProxy;
	enableHcaptcha.value = meta?.enableHcaptcha;
	enableRecaptcha.value = meta?.enableRecaptcha;
	enableIpLogging.value = meta?.enableIpLogging;
	enableActiveEmailValidation.value = meta?.enableActiveEmailValidation;

	secureMode.value = meta?.secureMode;
	privateMode.value = meta?.privateMode;
	allowedHosts.value = meta?.allowedHosts.join("\n");
}

function save() {
	os.apiWithDialog("admin/update-meta", {
		summalyProxy: summalyProxy.value,
		enableIpLogging: enableIpLogging.value,
		enableActiveEmailValidation: enableActiveEmailValidation.value,
	}).then(() => {
		updateInstanceCache();
	});
}

function saveInstance() {
	os.apiWithDialog("admin/update-meta", {
		secureMode: secureMode.value,
		privateMode: privateMode.value,
		allowedHosts: allowedHosts.value.split("\n"),
	}).then(() => {
		updateInstanceCache();
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.security,
	icon: `${icon("ph-lock")}`,
});
</script>
