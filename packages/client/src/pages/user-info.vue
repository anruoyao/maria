<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="600" :margin-min="16" :margin-max="32">
			<FormSuspense :p="init">
				<div v-if="tab === 'overview'" class="_formRoot">
					<div class="_formBlock aeakzknw">
						<MkAvatar
							class="avatar"
							:user="user"
							:show-indicator="true"
						/>
						<div class="body">
							<span class="name"
								><MkUserName class="name" :user="user"
							/></span>
							<span class="sub"
								><span class="acct _monospace"
									>@{{ acct.toString(user) }}</span
								></span
							>
							<span class="state">
								<span v-if="suspended" class="suspended"
									>Suspended</span
								>
								<span v-if="silenced" class="silenced"
									>Silenced</span
								>
								<span v-if="moderator" class="moderator"
									>Moderator</span
								>
							</span>
						</div>
					</div>

					<MkInfo
						v-if="user.username.includes('.')"
						class="_formBlock"
						warn
						>{{ i18n.ts.isSystemAccount }}</MkInfo
					>

					<div v-if="user.url" class="_formLinksGrid _formBlock">
						<FormLink :to="userPage(user)">Profile</FormLink>
						<FormLink :to="user.url" :external="true"
							>Profile (remote)</FormLink
						>
					</div>
					<FormLink v-else class="_formBlock" :to="userPage(user)"
						>Profile</FormLink
					>

					<FormLink
						v-if="user.host"
						class="_formBlock"
						:to="`/instance-info/${user.host}`"
						>{{ i18n.ts.instanceInfo }}</FormLink
					>

					<div class="_formBlock">
						<MkKeyValue
							:copy="user.id"
							oneline
							style="margin: 1em 0"
						>
							<template #key>ID</template>
							<template #value
								><span class="_monospace">{{
									user.id
								}}</span></template
							>
						</MkKeyValue>
						<!-- 要る？
					<MkKeyValue v-if="ips.length > 0" :copy="user.id" oneline style="margin-block: 1em; margin-inline: 0;">
						<template #key>IP (recent)</template>
						<template #value><span class="_monospace">{{ ips[0].ip }}</span></template>
					</MkKeyValue>
					-->
						<MkKeyValue oneline style="margin: 1em 0">
							<template #key>{{ i18n.ts.createdAt }}</template>
							<template #value
								><span class="_monospace"
									><MkTime
										:time="user.createdAt"
										:mode="'detail'" /></span
							></template>
						</MkKeyValue>
						<MkKeyValue v-if="info" oneline style="margin: 1em 0">
							<template #key>{{
								i18n.ts.lastActiveDate
							}}</template>
							<template #value
								><span class="_monospace"
									><MkTime
										:time="info.lastActiveDate"
										:mode="'detail'" /></span
							></template>
						</MkKeyValue>
						<MkKeyValue v-if="info" oneline style="margin: 1em 0">
							<template #key>{{ i18n.ts.email }}</template>
							<template #value
								><span class="_monospace">{{
									info.email
								}}</span></template
							>
						</MkKeyValue>
					</div>

					<FormSection>
						<template #label>ActivityPub</template>

						<div class="_formBlock">
							<MkKeyValue
								v-if="user.host"
								oneline
								style="margin: 1em 0"
							>
								<template #key>{{
									i18n.ts.instanceInfo
								}}</template>
								<template #value
									><MkA
										:to="`/instance-info/${user.host}`"
										class="_link"
										>{{ user.host }}
										<i
											:class="icon('ph-caret-right ph-dir')"
										></i></MkA
								></template>
							</MkKeyValue>
							<MkKeyValue v-else oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.instanceInfo
								}}</template>
								<template #value>(Local user)</template>
							</MkKeyValue>
							<MkKeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.updatedAt
								}}</template>
								<template #value
									><MkTime
										v-if="user.lastFetchedAt"
										mode="detail"
										:time="user.lastFetchedAt"
									/><span v-else>N/A</span></template
								>
							</MkKeyValue>
							<MkKeyValue v-if="ap" oneline style="margin: 1em 0">
								<template #key>Type</template>
								<template #value
									><span class="_monospace">{{
										ap.type
									}}</span></template
								>
							</MkKeyValue>
						</div>

						<FormButton
							v-if="user.host != null"
							class="_formBlock"
							@click="updateRemoteUser"
							><i :class="icon('ph-arrows-clockwise')"></i>
							{{ i18n.ts.updateRemoteUser }}</FormButton
						>

						<FormFolder v-if="ap" class="_formBlock">
							<template #label>Raw</template>

							<MkObjectView tall :value="ap">
							</MkObjectView>
						</FormFolder>
					</FormSection>
				</div>
				<div v-else-if="tab === 'moderation'" class="_formRoot">
					<FormSelect
						v-model="emojiModPerm"
						class="_formBlock"
						@update:modelValue="setEmojiMod"
					>
						<template #label>{{ i18n.ts.emojiModPerm }}</template>
						<option value="unauthorized">
							{{ i18n.ts._emojiModPerm.unauthorized }}
						</option>
						<option value="add">
							{{ i18n.ts._emojiModPerm.add }}
						</option>
						<option value="mod">
							{{ i18n.ts._emojiModPerm.mod }}
						</option>
						<option value="full">
							{{ i18n.ts._emojiModPerm.full }}
						</option>
					</FormSelect>
					<MkInfo class="_formBlock">{{
						i18n.ts.emojiModPermDescription
					}}</MkInfo>

					<FormSwitch
						v-if="
							user.host == null &&
							isAdmin &&
							(moderator || !user.isAdmin)
						"
						v-model="moderator"
						class="_formBlock"
						@update:modelValue="toggleModerator"
						>{{ i18n.ts.moderator }}</FormSwitch
					>
					<FormSwitch
						v-model="silenced"
						class="_formBlock"
						@update:modelValue="toggleSilence"
						>{{ i18n.ts.silence }}</FormSwitch
					>
					<FormSwitch
						v-model="suspended"
						class="_formBlock"
						@update:modelValue="toggleSuspend"
						>{{ i18n.ts.suspend }}</FormSwitch
					>
					{{ i18n.ts.reflectMayTakeTime }}
					<div class="_formBlock">
						<FormButton
							v-if="user.host == null && isModerator"
							inline
							style="margin-block-end: 0.4rem"
							@click="resetPassword"
							><i :class="icon('ph-password')"></i>
							{{ i18n.ts.resetPassword }}</FormButton
						>
						<FormButton
							v-if="user.host == null && isModerator"
							inline
							@click="sendModMail"
							><i :class="icon('ph-warning-diamond')"></i>
							{{ i18n.ts.sendModMail }}</FormButton
						>
						<FormButton
							v-if="user.host == null && isAdmin"
							inline
							danger
							@click="delete2fa"
							><i :class="icon('ph-key')"></i>
							{{ i18n.ts.delete2fa }}</FormButton
						>
						<FormButton
							v-if="user.host == null && isAdmin"
							inline
							danger
							@click="deletePasskeys"
							><i :class="icon('ph-poker-chip')"></i>
							{{ i18n.ts.deletePasskeys }}</FormButton
						>
						<FormButton
							v-if="isAdmin"
							inline
							primary
							danger
							@click="deleteAccount"
							><i :class="icon('ph-user-minus')"></i>
							{{ i18n.ts.deleteAccount }}</FormButton
						>
					</div>
					<FormTextarea
						v-model="moderationNote"
						manual-save
						class="_formBlock"
					>
						<template #label>{{ i18n.ts.moderationNote }}</template>
					</FormTextarea>
					<FormFolder class="_formBlock">
						<template #label>IP</template>
						<MkInfo v-if="!isAdmin" warn>{{
							i18n.ts.requireAdminForView
						}}</MkInfo>
						<MkInfo v-else>{{
							i18n.ts.ipFirstAcknowledged
						}}</MkInfo>
						<template v-if="isAdmin && ips">
							<div
								v-for="record in ips"
								:key="record.ip"
								class="_monospace"
								:class="$style.ip"
								style="margin: 1em 0"
							>
								<span class="date">{{ record.createdAt }}</span>
								<span class="ip">{{ record.ip }}</span>
							</div>
						</template>
					</FormFolder>
					<FormFolder class="_formBlock">
						<template #label>{{ i18n.ts.files }}</template>

						<MkFileListForAdmin
							:pagination="filesPagination"
							view-mode="grid"
						/>
					</FormFolder>
					<FormSection>
						<template #label>{{
							i18n.ts.driveCapacityOverride
						}}</template>

						<FormInput
							v-if="user.host == null"
							v-model="driveCapacityOverrideMb"
							inline
							:manual-save="true"
							type="number"
							:placeholder="
								i18n.t('defaultValueIs', {
									value: defaultDriveCapacity,
								})
							"
							@update:model-value="applyDriveCapacityOverride"
						>
							<template #label>{{
								i18n.ts.driveCapOverrideLabel
							}}</template>
							<template #suffix>MB</template>
							<template #caption>
								{{ i18n.ts.driveCapOverrideCaption }}
							</template>
						</FormInput>
					</FormSection>
				</div>
				<div v-else-if="tab === 'raw'" class="_formRoot">
					<MkObjectView v-if="info && isAdmin" tall :value="info">
					</MkObjectView>

					<MkObjectView tall :value="user"> </MkObjectView>
				</div>
			</FormSuspense>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { acct, type entities } from "firefish-js";
import MkObjectView from "@/components/MkObjectView.vue";
import FormTextarea from "@/components/form/textarea.vue";
import FormSwitch from "@/components/form/switch.vue";
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import FormButton from "@/components/MkButton.vue";
import FormInput from "@/components/form/input.vue";
import FormFolder from "@/components/form/folder.vue";
import FormSelect from "@/components/form/select.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import FormSuspense from "@/components/form/suspense.vue";
import MkFileListForAdmin from "@/components/MkFileListForAdmin.vue";
import MkInfo from "@/components/MkInfo.vue";
import * as os from "@/os";
import { url } from "@/config";
import { userPage } from "@/filters/user";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import { isAdmin, isModerator } from "@/me";
import { getInstanceInfo } from "@/instance";
import icon from "@/scripts/icon";

const props = defineProps<{
	userId: string;
}>();

const tab = ref("overview");
const user = ref<null | entities.UserDetailed>();
const init = ref<ReturnType<typeof createFetcher>>();
const info = ref();
const ips = ref(null);
const ap = ref(null);
const moderator = ref(false);
const emojiModPerm = ref<"unauthorized" | "add" | "mod" | "full">();
const silenced = ref(false);
const suspended = ref(false);
const driveCapacityOverrideMb = ref<number | null>(0);
const moderationNote = ref("");
const filesPagination = {
	endpoint: "admin/drive/files" as const,
	limit: 10,
	params: computed(() => ({
		userId: props.userId,
	})),
};

const defaultDriveCapacity = getInstanceInfo().driveCapacityPerLocalUserMb;

function createFetcher() {
	if (isModerator) {
		return () =>
			Promise.all([
				os.api("users/show", {
					userId: props.userId,
				}),
				os.api("admin/show-user", {
					userId: props.userId,
				}),
				isAdmin
					? os.api("admin/get-user-ips", {
							userId: props.userId,
						})
					: Promise.resolve(null),
			]).then(([_user, _info, _ips]) => {
				user.value = _user;
				info.value = _info;
				ips.value = _ips;
				moderator.value = info.value.isModerator;
				emojiModPerm.value = info.value.emojiModPerm;
				silenced.value = info.value.isSilenced;
				suspended.value = info.value.isSuspended;
				driveCapacityOverrideMb.value = user.value.driveCapacityOverrideMb;
				moderationNote.value = info.value.moderationNote;

				watch(moderationNote, async () => {
					await os.api("admin/update-user-note", {
						userId: user.value.id,
						text: moderationNote.value,
					});
					await refreshUser();
				});
			});
	} else {
		return () =>
			os
				.api("users/show", {
					userId: props.userId,
				})
				.then((res) => {
					user.value = res;
				});
	}
}

function refreshUser() {
	init.value = createFetcher();
}

async function updateRemoteUser() {
	await os.apiWithDialog("federation/update-remote-user", {
		userId: user.value.id,
	});
	refreshUser();
}

async function resetPassword() {
	const { password } = await os.api("admin/reset-password", {
		userId: user.value.id,
	});

	os.alert({
		type: "success",
		text: i18n.t("newPasswordIs", { password }),
	});
}

async function toggleSilence(v) {
	const confirm = await os.confirm({
		type: "warning",
		text: v ? i18n.ts.silenceConfirm : i18n.ts.unsilenceConfirm,
	});
	if (confirm.canceled) {
		silenced.value = !v;
	} else {
		await os.api(v ? "admin/silence-user" : "admin/unsilence-user", {
			userId: user.value.id,
		});
		await refreshUser();
	}
}

async function toggleSuspend(v) {
	const confirm = await os.confirm({
		type: "warning",
		text: v ? i18n.ts.suspendConfirm : i18n.ts.unsuspendConfirm,
	});
	if (confirm.canceled) {
		suspended.value = !v;
	} else {
		await os.api(v ? "admin/suspend-user" : "admin/unsuspend-user", {
			userId: user.value.id,
		});
		await refreshUser();
	}
}

async function toggleModerator(v) {
	await os.api(v ? "admin/moderators/add" : "admin/moderators/remove", {
		userId: user.value.id,
	});
	await refreshUser();
}

async function setEmojiMod() {
	await os.api("admin/set-emoji-moderator", {
		userId: user.value.id,
		emojiModPerm: emojiModPerm.value,
	});
	await refreshUser();
}

async function sendModMail() {
	const { canceled, result } = await os.inputParagraph({
		title: "Moderation Notice",
	});
	if (canceled) return;
	await os.apiWithDialog("admin/send-mod-mail", {
		userId: user.value.id,
		comment: result,
	});
}

async function applyDriveCapacityOverride() {
	let driveCapOrMb = driveCapacityOverrideMb.value;
	if (driveCapacityOverrideMb.value && driveCapacityOverrideMb.value < 0) {
		driveCapOrMb = null;
	}
	try {
		await os.apiWithDialog("admin/drive-capacity-override", {
			userId: user.value.id,
			overrideMb: driveCapOrMb,
		});
		await refreshUser();
	} catch (err) {
		os.alert({
			type: "error",
			text: err.toString(),
		});
	}
}

async function delete2fa() {
	const confirm = await os.confirm({
		type: "warning",
		text: i18n.ts.delete2faConfirm,
	});
	if (confirm.canceled) return;

	const typed = await os.inputText({
		text: i18n.t("typeToConfirm", { x: user.value?.username }),
	});
	if (typed.canceled) return;

	if (typed.result === user.value?.username) {
		await os.apiWithDialog("admin/delete-2fa", {
			userId: user.value.id,
		});
	} else {
		os.alert({
			type: "error",
			text: i18n.ts.inputNotMatch,
		});
	}
}

async function deletePasskeys() {
	const confirm = await os.confirm({
		type: "warning",
		text: i18n.ts.deletePasskeysConfirm,
	});
	if (confirm.canceled) return;

	const typed = await os.inputText({
		text: i18n.t("typeToConfirm", { x: user.value?.username }),
	});
	if (typed.canceled) return;

	if (typed.result === user.value?.username) {
		await os.apiWithDialog("admin/delete-passkeys", {
			userId: user.value.id,
		});
	} else {
		os.alert({
			type: "error",
			text: i18n.ts.inputNotMatch,
		});
	}
}

async function deleteAccount() {
	const confirm = await os.confirm({
		type: "warning",
		text: i18n.ts.deleteAccountConfirm,
	});
	if (confirm.canceled) return;

	const typed = await os.inputText({
		text: i18n.t("typeToConfirm", { x: user.value?.username }),
	});
	if (typed.canceled) return;

	if (typed.result === user.value?.username) {
		await os.apiWithDialog("admin/delete-account", {
			userId: user.value.id,
		});
	} else {
		os.alert({
			type: "error",
			text: i18n.ts.inputNotMatch,
		});
	}
}

watch(
	() => props.userId,
	() => {
		init.value = createFetcher();
	},
	{
		immediate: true,
	},
);

watch(user, () => {
	if (isAdmin) {
		os.api("ap/get", {
			uri: user.value.uri ?? `${url}/users/${user.value.id}`,
		}).then((res) => {
			ap.value = res;
		});
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() =>
	[
		{
			key: "overview",
			title: i18n.ts.overview,
			icon: `${icon("ph-info")}`,
		},
		isModerator
			? {
					key: "moderation",
					title: i18n.ts.moderation,
					icon: `${icon("ph-shield")}`,
				}
			: null,
		{
			key: "raw",
			title: "Raw",
			icon: `${icon("ph-code")}`,
		},
	].filter((x) => x != null),
);

definePageMetadata(
	computed(() => ({
		title: user.value ? acct.toString(user.value) : i18n.ts.userInfo,
		icon: `${icon("ph-info")}`,
	})),
);
</script>

<style lang="scss" scoped>
.aeakzknw {
	display: flex;
	align-items: center;

	> .avatar {
		display: block;
		inline-size: 64px;
		block-size: 64px;
		margin-inline-end: 16px;
	}

	> .body {
		flex: 1;
		overflow: hidden;

		> .name {
			display: block;
			inline-size: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		> .sub {
			display: block;
			inline-size: 100%;
			font-size: 85%;
			opacity: 0.7;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		> .state {
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
			margin-block-start: 4px;

			&:empty {
				display: none;
			}

			> .suspended,
			> .silenced,
			> .moderator {
				display: inline-block;
				border: solid 1px;
				border-radius: 6px;
				padding-block: 2px;
				padding-inline: 6px;
				font-size: 85%;
			}

			> .suspended {
				color: var(--error);
				border-color: var(--error);
			}

			> .silenced {
				color: var(--warn);
				border-color: var(--warn);
			}

			> .moderator {
				color: var(--success);
				border-color: var(--success);
			}
		}
	}
}
</style>

<style lang="scss" module>
.ip {
	display: flex;

	> :global(.date) {
		opacity: 0.7;
	}

	> :global(.ip) {
		margin-inline-start: auto;
	}
}
</style>
