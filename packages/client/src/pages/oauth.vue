<template>
	<MkSpacer :content-max="800">
		<div v-if="me">
			<div
				v-if="state == 'waiting'"
				class="waiting _section"
				:class="[$style.section]"
			>
				<div class="_content">
					<MkLoading />
				</div>
			</div>
			<div
				v-if="state == 'denied'"
				class="denied _section"
				:class="[$style.section]"
			>
				<div class="_content">
					<p>{{ i18n.ts._auth.denied }}</p>
				</div>
			</div>
			<div
				v-else-if="state == 'error'"
				class="error _section"
				:class="[$style.section]"
			>
				<div class="_content">
					<p>{{ message }}</p>
				</div>
			</div>
			<div
				v-else-if="state == 'accepted-oob'"
				class="accepted-oob _section"
				:class="[$style.section]"
			>
				<div class="_content">
					<p>{{ i18n.ts._auth.copyAsk }}</p>
					<pre>{{ code }}</pre>
				</div>
			</div>
			<div
				v-else-if="state == 'accepted'"
				class="accepted _section"
				:class="[$style.section]"
			>
				<div class="_content">
					<p>{{ i18n.ts._auth.callback }}<MkEllipsis /></p>
				</div>
			</div>
			<div v-else class="_section" :class="[$style.section]">
				<div :class="[$style.container]">
					<button
						v-click-anime
						class="item _button"
						:class="[$style.account]"
						@click="openAccountMenu"
					>
						<MkAvatar
							:user="me"
							:class="[$style.icon]"
							disableLink
						/>
					</button>
					<div :class="[$style.left]">
						<div>{{ i18n.ts.you }}</div>
						<div>
							@{{ me.username
							}}<span :class="[$style.fade]"
								>@{{ config.host }}</span
							>
						</div>
					</div>
				</div>
				<hr />
				<h2>{{ i18n.ts._auth.authRequired }}</h2>
				<div v-if="name" class="_title">
					{{ i18n.t("_auth.shareAccess", { name: name }) }}
				</div>
				<div v-else class="_title">
					{{ i18n.ts._auth.shareAccessAsk }}
				</div>
				<div class="_content">
					<p>{{ i18n.ts._auth.permissionAsk }}</p>
					<div :class="[$style.permissions]">
						<div
							v-for="p in _scopes"
							:key="p"
							:class="[$style.permission]"
						>
							<i
								:class="[getIcon(p)]"
								class="ph-bold ph-xl"
								style="margin-inline-end: 0.5rem"
							></i>
							<span class="monospace">{{ p }}</span>
						</div>
					</div>
				</div>
				<div class="_footer">
					<MkButton inline @click="deny">{{
						i18n.ts.cancel
					}}</MkButton>
					<MkButton inline primary @click="accept">{{
						i18n.ts.accept
					}}</MkButton>
				</div>
			</div>
		</div>
		<div v-else class="signin">
			<MkSignin @login="onLogin" />
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import MkSignin from "@/components/MkSignin.vue";
import MkButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { me } from "@/me";
import { signIn, openAccountMenu as openAccountMenu_ } from "@/account";
import { appendQuery, query } from "@/scripts/url";
import { i18n } from "@/i18n";
import * as config from "@/config.js";
import icon from "@/scripts/icon";

const props = defineProps<{
	response_type: string;
	client_id: string;
	redirect_uri: string;
	scope?: string;
	force_login?: boolean;
	lang?: string;
	state?: string;
}>();

const _scopes = props.scope?.split(" ")?.filter((p) => p.length > 0) ?? [
	"read",
];

const state = ref<string | null>(null);
const code = ref<string | null>(null);
const name = ref<string | null>(null);
const message = ref<string>("Unknown error occurred");

if (me) {
	await os
		.api("v1/firefish/apps/info", {
			client_id: props.client_id,
		})
		.then((res) => {
			name.value = res.name;
		})
		.catch((reason) => {
			message.value = reason;
			state.value = "error";
		});
}

const redirectUri = new URLSearchParams(window.location.search).get(
	"redirect_uri",
);
if (redirectUri !== props.redirect_uri)
	console.warn(
		`Mismatching redirect_uris between props (${props.redirect_uri}) and getUrlParams (${redirectUri})`,
	);

function getIcon(p: string) {
	if (p.startsWith("write")) return icon("ph-pencil-simple");
	else if (p.startsWith("read")) return icon("ph-eye");
	else if (p.startsWith("push")) return icon("ph-bell-ringing");
	else if (p.startsWith("follow")) return icon("ph-users");
	else return icon("ph-check-fat");
}

async function accept(): Promise<void> {
	state.value = "waiting";
	const res = await os
		.api("v1/firefish/auth/code", {
			client_id: props.client_id,
			redirect_uri: redirectUri,
			scopes: _scopes,
		})
		.catch((r) => {
			message.value = r;
			state.value = "error";
			throw r;
		});

	if (props.redirect_uri !== "urn:ietf:wg:oauth:2.0:oob" && redirectUri) {
		state.value = "accepted";
		location.href = appendQuery(
			redirectUri,
			query({
				code: res.code,
				state: props.state,
			}),
		);
	} else {
		code.value = res.code;
		state.value = "accepted-oob";
	}
}

function deny(): void {
	state.value = "denied";
}

async function onLogin(res): Promise<void> {
	await signIn(res.i);
}

function openAccountMenu(ev: MouseEvent) {
	openAccountMenu_(
		{
			includeCurrentAccount: true,
			withExtraOperation: true,
			withoutProfileLink: true,
		},
		ev,
	);
}
</script>

<style lang="scss" module>
.monospace {
	font-family: monospace;
}

.permissions {
	justify-content: center;
	padding-block-start: var(--margin);
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-block-end: 2rem;
}

.permission {
	display: inline-flex;
	padding-block: 0.5rem;
	padding-inline: 1rem;
	border-radius: var(--radius);
	background-color: var(--buttonBg);
	color: var(--fg);
}

.container {
	display: flex;
	align-items: center;
	justify-content: center;
}

.account {
	margin-inline-end: 20px;
}

.icon {
	display: inline-block;
	inline-size: 55px;
	aspect-ratio: 1;
}

.section {
	background: var(--panel);
	padding-block: 20px;
	padding-inline: 32px;
	border-radius: var(--radius);
	font-size: 1.05em;
	text-align: center;
}

.fade {
	opacity: 0.5;
}

.left {
	text-align: start;
}
</style>
