<template>
	<header
		v-if="show"
		ref="el"
		class="fdidabkb"
		:class="{ thin: thin_, tabs: isTabs(tabs)}"
		:style="{ background: bg || undefined }"
		@click="onClick"
	>
		<div class="left">
			<div class="buttons">
				<button
					v-if="displayBackButton"
					v-tooltip.noDelay="i18n.ts.goBack"
					v-vibrate="5"
					class="_buttonIcon button icon backButton"
					@click.stop="goBack()"
					@touchstart="preventDrag"
				>
					<i :class="icon('ph-dir ph-caret-left')"></i>
				</button>
				<MkAvatar
					v-if="narrow && props.displayMyAvatar && me"
					v-vibrate="5"
					class="avatar button"
					:user="me"
					:disable-preview="true"
					disable-link
					@click.stop="openAccountMenu"
				/>
			</div>
			<div
				v-if="!hideTitle && metadata"
				class="titleContainer"
				@click="showTabsPopup"
			>
				<MkAvatar
					v-if="metadata && metadata.avatar"
					class="avatar"
					:user="metadata.avatar"
					:show-indicator="true"
				/>
				<i
					v-else-if="metadata.icon && !narrow"
					class="icon"
					:class="icon(metadata.icon)"
				></i>

				<div class="title">
					<MkUserName
						v-if="metadata.userName"
						:user="metadata.userName"
						:nowrap="true"
						class="title"
					/>
					<div
						v-else-if="
							metadata.title &&
							!(tabs != null && tabs.length > 0 && narrow)
						"
						class="title"
					>
						{{ metadata.title }}
					</div>
					<div v-if="!narrow && metadata.subtitle" class="subtitle">
						{{ metadata.subtitle }}
					</div>
				</div>
			</div>
		</div>
		<template v-if="metadata">
			<nav
				v-if="isTabs(tabs)"
				ref="tabsEl"
				class="tabs"
				:class="{ collapse: tabs.length > 3 }"
			>
				<button
					v-for="tab in tabs"
					:ref="(el) => (tab.key && (tabRefs[tab.key] = el))"
					v-tooltip.noDelay="tab.title"
					v-vibrate="5"
					class="tab _button"
					:class="{
						active: tab.key != null && tab.key === props.tab,
					}"
					@mousedown="(ev) => onTabMousedown(tab, ev)"
					@click="(ev) => onTabClick(tab, ev)"
				>
					<i v-if="tab.icon" class="icon" :class="tab.icon"></i>
					<span class="title">{{ tab.title }}</span>
				</button>
				<div ref="tabHighlightEl" class="highlight"></div>
			</nav>
		</template>
		<div class="buttons right">
			<template v-if="metadata && metadata.avatar">
				<MkFollowButton
					v-if="narrow"
					:user="metadata.avatar"
					:full="false"
					class="fullButton"
				></MkFollowButton>
				<MkFollowButton
					v-else
					:user="metadata.avatar"
					:full="true"
					class="fullButton"
				></MkFollowButton>
			</template>
			<template v-for="action in actions">
				<button
					v-tooltip.noDelay="action.text"
					v-vibrate="5"
					class="_buttonIcon button"
					:class="{ highlighted: action.highlighted }"
					@click.stop="action.handler"
					@touchstart="preventDrag"
				>
					<i :class="action.icon"></i>
				</button>
			</template>
		</div>
	</header>
</template>

<script lang="ts" setup>
import {
	computed,
	inject,
	nextTick,
	onMounted,
	onUnmounted,
	ref,
	watch,
} from "vue";
import MkFollowButton from "@/components/MkFollowButton.vue";
import { popupMenu } from "@/os";
import { scrollToTop } from "@/scripts/scroll";
import { injectPageMetadata } from "@/scripts/page-metadata";
import { openAccountMenu as openAccountMenu_ } from "@/account";
import { me } from "@/me";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

interface Tab {
	key?: string | null;
	title: string;
	icon?: string;
	iconOnly?: boolean;
	onClick?: (ev: MouseEvent) => void;
}

const props = defineProps<{
	tabs?: Tab[] | null;
	tab?: string;
	actions?: {
		text: string;
		icon: string;
		highlighted?: boolean;
		handler: (ev: MouseEvent) => void;
	}[];
	thin?: boolean;
	displayMyAvatar?: boolean;
	displayBackButton?: boolean;
	to?: string;
}>();

const displayBackButton =
	props.displayBackButton &&
	history.length > 1 &&
	inject("shouldBackButton", true);

const emit = defineEmits<{
	"update:tab": [key: string];
}>();

const metadata = injectPageMetadata();

const hideTitle = inject("shouldOmitHeaderTitle", false);
const thin_ = props.thin || inject("shouldHeaderThin", false);

const el = ref<HTMLElement | null>(null);
const tabRefs = {};
const tabHighlightEl = ref<HTMLElement | null>(null);
const tabsEl = ref<HTMLElement | null>(null);
const bg = ref<string | null | number>(null);
const narrow = ref(false);
const hasTabs = computed(() => props.tabs && props.tabs.length > 0);

function isTabs(t: Tab[] | undefined): t is Tab[] {
	return t != null && t.length > 0;
}

const hasActions = computed(() => props.actions && props.actions.length > 0);
const show = computed(() => {
	return !hideTitle || hasTabs.value || hasActions.value;
});

const openAccountMenu = (ev: MouseEvent) => {
	openAccountMenu_(
		{
			withExtraOperation: true,
		},
		ev,
	);
};

const showTabsPopup = (ev: MouseEvent) => {
	if (!isTabs(props.tabs)) return;
	if (!narrow.value) return;
	ev.preventDefault();
	ev.stopPropagation();
	const menu = props.tabs.map((tab) => ({
		text: tab.title,
		icon: tab.icon,
		active: tab.key != null && tab.key === props.tab,
		action: (ev) => {
			onTabClick(tab, ev);
		},
	}));
	popupMenu(menu, (ev.currentTarget ?? ev.target) as HTMLElement);
};

const preventDrag = (ev: TouchEvent) => {
	ev.stopPropagation();
};

const onClick = () => {
	if (props.to) {
		location.href = props.to;
	} else {
		if (el.value) {
			scrollToTop(el.value, { behavior: "smooth" });
		}
	}
};

function onTabMousedown(tab: Tab, ev: MouseEvent): void {
	// ユーザビリティの観点からmousedown時にはonClickは呼ばない
	if (tab.key) {
		emit("update:tab", tab.key);
	}
}

function onTabClick(tab: Tab, ev: MouseEvent): void {
	if (tab.onClick) {
		ev.preventDefault();
		ev.stopPropagation();
		tab.onClick(ev);
	}
	if (tab.key) {
		emit("update:tab", tab.key);
	}
}

function goBack(): void {
	window.history.back();
}

let ro: ResizeObserver | null;

onMounted(() => {
	watch(
		() => [props.tab, props.tabs],
		() => {
			nextTick(async () => {
				await document.fonts.ready;
				if (props.tab == null) return;
				if (!isTabs(props.tabs)) return;
				const tabEl = tabRefs[props.tab];
				if (tabEl && tabHighlightEl.value) {
					const isVertical = getComputedStyle(tabHighlightEl.value)[
						"writing-mode"
					].startsWith("vertical");
					// offsetWidth や offsetLeft は少数を丸めてしまうため getBoundingClientRect を使う必要がある
					// https://developer.mozilla.org/ja/docs/Web/API/HTMLElement/offsetWidth#%E5%80%A4
					const tabSizeX =
						(isVertical ? tabEl.scrollHeight : tabEl.scrollWidth) + 20; // + the tab's padding
					if (props.tabs.length > 3) {
						tabEl.style = `--width: ${tabSizeX}px`;
					}
					setTimeout(() => {
						if (tabHighlightEl.value == null) return;
						let translateFunction = "translateX";
						let translateValue = tabEl.offsetLeft;
						if (isVertical) {
							translateFunction = "translateY";
							translateValue = tabEl.offsetTop;
						}
						if (getComputedStyle(tabHighlightEl.value).direction === "rtl") {
							translateValue += isVertical
								? tabEl.offsetHeight - tabEl.offsetParent.scrollHeight
								: tabEl.offsetWidth - tabEl.offsetParent.scrollWidth;
						}
						tabHighlightEl.value.style.inlineSize = `${tabSizeX}px`;
						tabHighlightEl.value.style.transform = `${translateFunction}(${translateValue}px)`;
						window.requestAnimationFrame(() => {
							tabsEl.value?.scrollTo({
								left: translateValue - 60,
								behavior: "smooth",
							});
						});
					}, 200);
				}
			});
		},
		{
			immediate: true,
		},
	);

	if (el.value?.parentElement) {
		narrow.value = el.value.parentElement.offsetWidth < 500;
		ro = new ResizeObserver((_entries, _observer) => {
			if (el.value?.parentElement && document.body.contains(el.value)) {
				narrow.value = el.value.parentElement.offsetWidth < 500;
			}
		});
		ro.observe(el.value.parentElement);
	}
});

onUnmounted(() => {
	if (ro) ro.disconnect();
});
</script>

<style lang="scss" scoped>
.fdidabkb {
	--height: 55px;
	display: flex;
	justify-content: space-between;
	inline-size: 100%;
	block-size: var(--height);
	padding-inline: 24px;
	box-sizing: border-box;
	overflow: hidden;
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	@media (max-inline-size: 500px) {
		padding-inline: 16px;
		&.tabs > .buttons > :deep(.follow-button > span) {
			display: none;
		}
	}
	@media (max-inline-size: 700px) {
		> .left {
			min-inline-size: unset !important;
			max-inline-size: 40%;
		}
		> .left,
		> .right {
			flex: unset !important;
		}
		&:not(.tabs) {
			> .left {
				inline-size: 0 !important;
				flex-grow: 1 !important;
				max-inline-size: unset !important;
			}
		}
		&.tabs {
			> .left {
				flex-shrink: 0 !important;
			}

			.buttons ~ .titleContainer > .title {
				display: none;
			}
		}
	}

	&::before {
		content: "";
		position: absolute;
		inset: 0;
		border-block-end: solid 0.5px var(--divider);
		z-index: -1;
	}
	&::after {
		content: "";
		position: absolute;
		inset: 0;
		background: var(--bg);
		opacity: 0.85;
		z-index: -2;
	}

	&.thin {
		--height: 45px;

		.buttons {
			> .button {
				font-size: 0.9em;
			}
		}
	}

	> .left {
		display: flex;
		> .buttons {
			&:not(:empty) {
				margin-inline-end: 8px;
				margin-inline-start: calc(0px - var(--margin));
			}
			> .avatar {
				inline-size: 32px;
				block-size: 32px;
				margin-inline-start: var(--margin);
			}
		}
	}

	.buttons {
		--margin: 8px;
		display: flex;
		align-items: center;
		block-size: var(--height);
		&.right {
			justify-content: flex-end;
			z-index: 2;
			// margin-inline-end: calc(0px - var(--margin));
			// margin-inline-start: var(--margin);
			> .button:last-child {
				margin-inline-end: calc(0px - var(--margin));
			}
		}

		> .fullButton {
			& + .fullButton {
				margin-inline-start: 12px;
			}
		}
	}

	> .left {
		> .backButton {
			display: flex;
			align-items: center;
			justify-content: center;
		}
		> .titleContainer {
			display: flex;
			align-items: center;
			max-inline-size: 400px;
			overflow: auto;
			white-space: nowrap;
			text-align: start;
			font-weight: bold;
			flex-shrink: 0;
			> .avatar {
				$size: 32px;
				display: inline-block;
				inline-size: $size;
				block-size: $size;
				vertical-align: bottom;
				margin-inline-end: 8px;
			}

			> .icon {
				margin-inline-end: 8px;
				min-inline-size: 16px;
				inline-size: 1em;
				text-align: center;
			}

			> .title {
				min-inline-size: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				line-height: 1.1;

				> .subtitle {
					opacity: 0.6;
					font-size: 0.8em;
					font-weight: normal;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;

					&.activeTab {
						text-align: center;

						> .chevron {
							display: inline-block;
							margin-inline-start: 6px;
						}
					}
				}
			}
		}
	}

	> .left,
	> .right {
		flex-basis: 100%;
		flex-shrink: 9999;
		overflow: hidden;
	}
	> .left {
		min-inline-size: 20%;
		margin-inline-start: -10px;
		padding-inline-start: 10px;
	}
	> .right {
		// margin-inline-start: auto;
		min-inline-size: max-content;
		margin-inline-end: -10px;
		padding-inline-end: 10px;
	}

	> .tabs {
		position: relative;
		font-size: 1em;
		overflow-x: auto;
		overflow-inline: auto;
		white-space: nowrap;
		contain: content;
		display: flex;
		padding-inline: 20px;
		margin-inline: -20px;
		mask: linear-gradient(
			var(--gradient-to-inline-end),
			transparent,
			black 20px calc(100% - 20px),
			transparent
		);
		-webkit-mask: linear-gradient(
			var(--gradient-to-inline-end),
			transparent,
			black 20px calc(100% - 20px),
			transparent
		);
		scrollbar-width: none;

		@supports not (overflow-inline: auto) {
			.vertical-lr &, .vertical-rl & {
				overflow-x: visible;
				overflow-y: auto;
			}
		}

		&::-webkit-scrollbar {
			display: none;
		}

		&.collapse {
			--width: 2.7em;
			// --width: 1.33333em
			> .tab {
				inline-size: 2.7em;
				min-inline-size: 2.7em !important;
				&:not(.active) > .title {
					opacity: 0;
				}
			}
		}
		&:not(.collapse) > .tab {
			--width: max-content !important;
		}

		> .tab {
			display: inline-flex;
			align-items: center;
			position: relative;
			border-inline: 10px solid transparent;
			block-size: 100%;
			min-inline-size: max-content;
			font-weight: normal;
			opacity: 0.7;
			overflow: hidden;
			transition:
				color 0.2s,
				opacity 0.2s,
				width 0.2s,
				min-width 0.2s;
			--width: 38px;

			&:hover {
				opacity: 1;
			}

			&.active {
				opacity: 1;
				color: var(--accent);
				font-weight: 600;
				inline-size: var(--width);
				min-inline-size: var(--width) !important;
			}

			> .icon + .title {
				margin-inline-start: 8px;
			}
			> .title {
				transition: opacity 0.2s;
			}
		}
		> .highlight {
			position: absolute;
			inset-block-end: 0;
			inset-inline-start: 0;
			block-size: 3px;
			background: var(--accent);
			border-radius: 999px;
			transition:
				width 0.2s,
				transform 0.2s;
			transition-timing-function: cubic-bezier(0, 0, 0, 1.2);
			pointer-events: none;
		}
	}
}
</style>
