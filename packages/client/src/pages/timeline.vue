<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader
				v-model:tab="src"
				:actions="headerActions"
				:tabs="headerTabs"
				:display-my-avatar="true"
				:class="{ isMobile: 'xytnxiau' }"
			/>
		</template>
		<MkSpacer :content-max="800" :class="{ isMobile: 'upsvvhaz' }">
			<div ref="rootEl" v-hotkey.global="keymap" class="cmuxhskf">
				<XPostForm
					v-if="defaultStore.reactiveState.showFixedPostForm.value"
					class="post-form _block"
					fixed
				/>
				<!-- <div v-if="!isMobile" class="tl _block">
				<XTimeline
					ref="tl"
					:key="src"
					class="tl"
					:src="src"
					:sound="true"
					@queue="queueUpdated"
				/>
			</div> *v-else on next div* -->
				<div class="tl _block">
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
						<swiper-slide
							v-for="index in timelines"
							:key="index"
							:virtual-index="index"
						>
							<XTimeline
								v-if="index == timelines[swiperRef.activeIndex]"
								ref="tl"
								:key="src"
								class="tl"
								:src="src"
								:sound="true"
							/>
						</swiper-slide>
					</swiper>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import XTutorial from "@/components/MkTutorialDialog.vue";
import XTimeline from "@/components/MkTimeline.vue";
import XPostForm from "@/components/MkPostForm.vue";
import * as os from "@/os";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { getInstanceInfo } from "@/instance";
import { isModerator, isSignedIn, me } from "@/me";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import icon from "@/scripts/icon";
import "swiper/scss";
import "swiper/scss/virtual";

if (isSignedIn(me) && defaultStore.reactiveState.tutorial.value !== -1) {
	os.popup(XTutorial, {}, {}, "closed");
}

const {
	disableLocalTimeline,
	enableGuestTimeline,
	disableRecommendedTimeline,
	disableGlobalTimeline,
} = getInstanceInfo();

const isHomeTimelineAvailable = isSignedIn(me);
const isLocalTimelineAvailable =
	(!disableLocalTimeline && (isSignedIn(me) || enableGuestTimeline)) ||
	isModerator;
const isSocialTimelineAvailable = isLocalTimelineAvailable && isSignedIn(me);
const isRecommendedTimelineAvailable =
	!disableRecommendedTimeline && isSignedIn(me);
const isGlobalTimelineAvailable =
	(!disableGlobalTimeline && (isSignedIn(me) || enableGuestTimeline)) ||
	isModerator;
const keymap = {
	t: focus,
};

const timelines = [];

if (isHomeTimelineAvailable) {
	timelines.push("home");
}
if (isSocialTimelineAvailable) {
	timelines.push("social");
}
if (isRecommendedTimelineAvailable) {
	timelines.push("recommended");
}
if (isLocalTimelineAvailable) {
	timelines.push("local");
}
if (isGlobalTimelineAvailable) {
	timelines.push("global");
}

const MOBILE_THRESHOLD = 500;

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isMobile = ref(
	deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD,
);
window.addEventListener("resize", () => {
	isMobile.value =
		deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD;
});

const tlComponent = ref<InstanceType<typeof XTimeline>>();
const rootEl = ref<HTMLElement>();

const timelineIndex = (timeline: string): number => {
	const index = timelines.indexOf(timeline);
	return index === -1 ? 0 : index;
};

const src = computed({
	get: () => defaultStore.reactiveState.tl.value.src,
	set: (x) => {
		saveSrc(x);
		syncSlide(timelineIndex(x));
	},
});

async function chooseList(ev: MouseEvent) {
	await os.api("users/lists/list").then((res) => {
		const items = [
			{
				type: "link" as const,
				text: i18n.ts.manageLists,
				icon: `${icon("ph-faders-horizontal")}`,
				to: "/my/lists",
			},
		].concat(
			res.map((list) => ({
				type: "link" as const,
				text: list.name,
				icon: "",
				to: `/timeline/list/${list.id}`,
			})),
		);
		os.popupMenu(items, ev.currentTarget ?? ev.target);
	});
}

async function chooseAntenna(ev: MouseEvent) {
	await os.api("antennas/list").then((res) => {
		const items = [
			{
				type: "link" as const,
				indicate: false,
				text: i18n.ts.manageAntennas,
				icon: `${icon("ph-faders-horizontal")}`,
				to: "/my/antennas",
			},
		].concat(
			res.map((antenna) => ({
				type: "link" as const,
				text: antenna.name,
				icon: "",
				indicate: antenna.hasUnreadNote,
				to: `/timeline/antenna/${antenna.id}`,
			})),
		);
		os.popupMenu(items, ev.currentTarget ?? ev.target);
	});
}

function saveSrc(
	newSrc: "home" | "local" | "social" | "recommended" | "global",
): void {
	defaultStore.set("tl", {
		...defaultStore.state.tl,
		src: newSrc,
	});
}

function focus(): void {
	tlComponent.value?.focus();
}

const headerActions = computed(() =>
	isSignedIn(me)
		? [
				{
					icon: `${icon("ph-list-bullets ph-dir")}`,
					title: i18n.ts.lists,
					text: i18n.ts.lists,
					iconOnly: true,
					handler: chooseList,
				},
				{
					icon: `${icon("ph-flying-saucer")}`,
					title: i18n.ts.antennas,
					text: i18n.ts.antennas,
					iconOnly: true,
					handler: chooseAntenna,
				} /* **TODO: fix timetravel** {
	icon: `${icon('ph-calendar-blank')}`,
	title: i18n.ts.jumpToSpecifiedDate,
	iconOnly: true,
	handler: timetravel,
} */,
			]
		: [],
);

const headerTabs = computed(() => [
	...(isHomeTimelineAvailable
		? [
				{
					key: "home",
					title: i18n.ts._timelines.home,
					icon: `${icon("ph-house")}`,
					iconOnly: true,
				},
			]
		: []),
	...(isSocialTimelineAvailable
		? [
				{
					key: "social",
					title: i18n.ts._timelines.social,
					icon: `${icon("ph-handshake")}`,
					iconOnly: true,
				},
			]
		: []),
	...(isRecommendedTimelineAvailable
		? [
				{
					key: "recommended",
					title: i18n.ts._timelines.recommended,
					icon: `${icon("ph-thumbs-up")}`,
					iconOnly: true,
				},
			]
		: []),
	...(isLocalTimelineAvailable
		? [
				{
					key: "local",
					title: i18n.ts._timelines.local,
					icon: `${icon("ph-users")}`,
					iconOnly: true,
				},
			]
		: []),
	...(isGlobalTimelineAvailable
		? [
				{
					key: "global",
					title: i18n.ts._timelines.global,
					icon: `${icon("ph-planet")}`,
					iconOnly: true,
				},
			]
		: []),
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.timeline,
		icon:
			src.value === "local"
				? "ph-users ph-lg"
				: src.value === "social"
					? "ph-handshake ph-lg"
					: src.value === "recommended"
						? "ph-thumbs-up ph-lg"
						: src.value === "global"
							? "ph-planet ph-lg"
							: "ph-house ph-lg",
	})),
);

let swiperRef: any = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(timelineIndex(src.value));
	const styles = getComputedStyle(swiper.el);
	swiper.changeLanguageDirection(styles.direction as "rtl" | "ltr");
	if (styles["writing-mode"].startsWith("vertical")) {
		swiper.changeDirection("vertical");
	}
}

function onSlideChange() {
	saveSrc(timelines[swiperRef.activeIndex]);
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}

onMounted(() => {
	syncSlide(timelineIndex(swiperRef.activeIndex));
});
</script>

<style lang="scss" scoped>
.xytnxiau {
	overflow-y: hidden;
	overflow-block: hidden;
	position: absolute;
	inset-block-start: 0;

	@supports not (overflow-block: hidden) {
		.vertical-lr &, .vertical-rl & {
			overflow-y: visible;
			overflow-x: hidden;
		}
	}
}

.upsvvhaz {
	padding-block-start: 67px;
}

.cmuxhskf {
	--swiper-theme-color: var(--accent);
	> .tl {
		background: none;
	}
}
</style>
