<template>
	<div
		ref="ticker"
		v-tooltip="
			`${capitalize(instance.softwareName)} ${
				instance.softwareVersion ?? ''
			}`
		"
		class="hpaizdrt"
		:style="bg"
	>
		<img class="icon" :src="getInstanceIcon(instance)" @error="getInstanceIconErrorEvent($event)" aria-hidden="true" />
		<span class="name">{{ instance.name }}</span>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import type { entities } from "firefish-js";
import { instanceName, version } from "@/config";
import { getInstanceInfo } from "@/instance";
import { getProxiedImageUrlNullable } from "@/scripts/media-proxy";

const props = defineProps<{
	instance?: entities.InstanceLite;
}>();

const ticker = ref<HTMLElement | null>(null);

// FIXME: the following assumption is not necessarily correct
// if no instance data is given, this is for the local instance
const instance = props.instance ?? {
	faviconUrl: getInstanceInfo().iconUrl || "/favicon.ico",
	name: instanceName,
	themeColor: (
		document.querySelector('meta[name="theme-color-orig"]') as HTMLMetaElement
	)?.content,
	softwareName: "Firefish",
	softwareVersion: version,
};

const commonNames = new Map<string, string>([
	["birdsitelive", "BirdsiteLIVE"],
	["bookwyrm", "BookWyrm"],
	["bridgy-fed", "Bridgy Fed"],
	["castopod", "CastoPod"],
	["foundkey", "FoundKey"],
	["gnusocial", "GNU social"],
	["gotosocial", "GoToSocial"],
	["kbin", "/kbin"],
	["kmyblue", "kmyblue"],
	["microblogpub", "microblog.pub"],
	["nextcloud social", "Nextcloud Social"],
	["peertube", "PeerTube"],
	["reel2bits", "reel2bits"],
	["snac", "snac"],
	["snac2", "snac2"],
	["takahe", "Takahē"],
	["wafrn", "WAFRN"],
	["wordpress", "WordPress"],
	["writefreely", "WriteFreely"],
	["wxwclub", "wxwClub"],
]);

const capitalize = (s?: string | null) => {
	if (s == null) return "Unknown";
	if (commonNames.has(s)) return commonNames.get(s);
	return s[0].toUpperCase() + s.slice(1);
};

const computedStyle = getComputedStyle(document.documentElement);
const themeColor =
	instance.themeColor ?? computedStyle.getPropertyValue("--bg");

const bg = {
	background: `linear-gradient(var(--gradient-to-inline-end), ${themeColor}, ${themeColor}55)`,
};

function getInstanceIcon(instance): string {
	return (
		getProxiedImageUrlNullable(instance.faviconUrl, "preview") ??
		getProxiedImageUrlNullable(instance.iconUrl, "preview") ??
		"/client-assets/dummy.png"
	);
}

function getInstanceIconErrorEvent($event) {
	$event.target.src = "/client-assets/dummy.png";
}
</script>

<style lang="scss" scoped>
.hpaizdrt {
	display: flex;
	align-items: center;
	block-size: 1.1em;
	justify-self: flex-end;
	padding-block: 0.2em;
	padding-inline: 0.4em;
	border-radius: 100px;
	font-size: 0.8em;
	text-shadow: 0 2px 2px var(--shadow);
	overflow: hidden;
	.header > .body & {
		inline-size: max-content;
		max-inline-size: 100%;
	}

	> .icon {
		block-size: 100%;
		border-radius: 0.3rem;
	}

	> .name {
		display: none;
		margin-inline-start: 4px;
		font-size: 0.85em;
		vertical-align: top;
		font-weight: bold;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-shadow:
			-1px -1px 0 var(--bg),
			1px -1px 0 var(--bg),
			-1px 1px 0 var(--bg),
			1px 1px 0 var(--bg);
		.article > .main &,
		.header > .body & {
			display: unset;
		}
	}
}
</style>
