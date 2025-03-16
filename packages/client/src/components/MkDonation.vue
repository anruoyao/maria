<template>
	<transition name="slide-fade">
		<div v-if="show" class="_panel _shadow _acrylic" :class="$style.root">
			<div :class="$style.icon">
				<i :class="icon('ph-hand-heart ph-5x', false)" />
			</div>
			<div :class="$style.main">
				<div :class="$style.title">
					{{ i18n.ts._aboutFirefish.donateTitle }}
				</div>
				<div :class="$style.text">
					{{ i18n.ts._aboutFirefish.pleaseDonateToFirefish }}
					<p v-if="instance.donationLink">
						{{
							i18n.t("_aboutFirefish.pleaseDonateToHost", {
								host: hostname,
							})
						}}
					</p>
				</div>
				<div class="_flexList" style="gap: 0.6rem">
					<MkButton
						primary
						@click="
							openExternal('https://opencollective.com/firefish')
						"
						>{{ i18n.ts._aboutFirefish.donate }}</MkButton
					>
					<MkButton
						v-if="instance.donationLink"
						gradate
						@click="openExternal(instance.donationLink!)"
						>{{
							i18n.t("_aboutFirefish.donateHost", {
								host: hostname,
							})
						}}</MkButton
					>
				</div>
				<div class="_flexList" style="margin-block-start: 0.6rem">
					<MkButton @click="close">{{
						i18n.ts.remindMeLater
					}}</MkButton>
					<MkButton @click="neverShow">{{
						i18n.ts.neverShow
					}}</MkButton>
				</div>
			</div>
			<button
				class="_button"
				:class="$style.close"
				:aria-label="i18n.ts.close"
				@click="close"
			>
				<i :class="icon('ph-x')"></i>
			</button>
		</div>
	</transition>
</template>

<script lang="ts" setup>
import { nextTick, ref } from "vue";
import MkButton from "@/components/MkButton.vue";
import { host } from "@/config";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { getInstanceInfo } from "@/instance";
import icon from "@/scripts/icon";

const show = ref(false);

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

const instance = getInstanceInfo();
const hostname =
	instance.name?.length && instance.name?.length < 38 ? instance.name : host;

const zIndex = os.claimZIndex("low");

function slideIn() {
	show.value = false;
	nextTick(() => {
		show.value = true;
	});
}

slideIn();

function close() {
	localStorage.setItem("latestDonationInfoShownAt", Date.now().toString());
	emit("closed");
	show.value = false;
}

function neverShow() {
	localStorage.setItem("neverShowDonationInfo", "true");
	close();
}

function openExternal(link: string) {
	window.open(link, "_blank");
}
</script>

<style lang="scss" scoped>
.slide-fade-enter-from {
	opacity: 0;
	transform: translateY(100%);
}

.slide-fade-enter-active {
	transition:
		opacity 0.5s,
		transform 0.5s ease-out;
}

.slide-fade-enter-to {
	opacity: 1;
	transform: translateY(0);
}

.slide-fade-leave-from {
	opacity: 1;
	transform: translateY(0);
}

.slide-fade-leave-active {
	transition:
		opacity 0.5s,
		transform 0.5s ease-out;
}

.slide-fade-leave-to {
	opacity: 0;
	transform: translateY(100%);
}
</style>

<style lang="scss" module>
.root {
	background-color: var(--windowHeader);
	position: fixed;
	z-index: v-bind(zIndex);
	inset-block-end: var(--margin);
	inset-inline-start: 2%;
	inset-block-end: 2%;
	margin: auto;
	box-sizing: border-box;
	inline-size: calc(100% - (var(--margin) * 2));
	max-inline-size: 500px;
	display: flex;
}

.icon {
	text-align: center;
	padding-block-start: 25px;
	inline-size: 100px;
	color: var(--accent);
}

@media (max-inline-size: 500px) {
	.icon {
		inline-size: 80px;
	}
}

@media (max-inline-size: 450px) {
	.icon {
		inline-size: 70px;
	}
}

.main {
	padding-block-start: 25px;
	padding-inline-end: 25px;
	padding-block-end: 25px;
	padding-inline-start: 0;
	flex: 1;
}

.close {
	position: absolute;
	inset-block-start: 8px;
	inset-inline-end: 8px;
	padding: 8px;
}

.title {
	font-weight: bold;
}
.text {
	margin-block-start: 0.7em;
	margin-inline-end: 0;
	margin-block-end: 1em;
	margin-inline-start: 0;
}
</style>
