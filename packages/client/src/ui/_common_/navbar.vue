<template>
	<header class="mvcprjjd sidebar" :class="{ iconOnly }">
		<div class="body">
			<div class="top">
				<div
					class="banner"
					:user="me"
					:style="{ backgroundImage: `url(${me.bannerUrl})` }"
				></div>
				<button
					v-click-anime
					v-tooltip.noDelay.right="
						`${i18n.ts.account}: @${me.username}`
					"
					class="item _button account"
					@click="openAccountMenu"
				>
					<MkAvatar
						:user="me"
						class="icon"
						disable-link
					/><!-- <MkAcct class="text" :user="me"/> -->
				</button>
			</div>
			<nav class="middle">
				<MkA
					v-click-anime
					v-tooltip.noDelay.right="i18n.ts.timeline"
					class="item _button index"
					active-class="active"
					to="/"
					exact
				>
					<i :class="icon('ph-house icon ph-fw')"></i
					><span class="text">{{ i18n.ts.timeline }}</span>
				</MkA>
				<template v-for="item in menu">
					<div v-if="item === '-'" class="divider"></div>
					<component
						:is="navbarItemDef[item].to ? 'MkA' : 'button'"
						v-else-if="
							navbarItemDef[item] &&
							navbarItemDef[item].show !== false
						"
						v-click-anime
						v-tooltip.noDelay.right="
							i18n.ts[navbarItemDef[item].title]
						"
						class="item _button"
						:class="[item, { active: navbarItemDef[item].active }]"
						active-class="active"
						:to="navbarItemDef[item].to"
						v-on="
							navbarItemDef[item].action
								? { click: navbarItemDef[item].action }
								: {}
						"
					>
						<i
							class="icon ph-fw ph-lg"
							:class="navbarItemDef[item].icon"
						></i
						><span class="text">{{
							i18n.ts[navbarItemDef[item].title]
						}}</span>
						<span
							v-if="navbarItemDef[item].indicated"
							class="indicator"
							><i class="icon ph-circle ph-fill"></i
						></span>
					</component>
				</template>
				<div class="divider"></div>
				<MkA
					v-if="isModerator"
					v-click-anime
					v-tooltip.noDelay.right="i18n.ts.controlPanel"
					class="item _button"
					active-class="active"
					to="/admin"
				>
					<span
						v-if="
							thereIsUnresolvedAbuseReport ||
							noMaintainerInformation ||
							noBotProtection ||
							noEmailServer ||
							updateAvailable
						"
						class="indicator"
					></span
					><i :class="icon('ph-door icon ph-fw')"></i
					><span class="text">{{ i18n.ts.controlPanel }}</span>
				</MkA>
				<MkA
					v-else-if="me.emojiModPerm !== 'unauthorized'"
					v-click-anime
					v-tooltip.noDelay.right="i18n.ts.customEmojis"
					class="item _button"
					active-class="active"
					to="/admin/emojis"
				>
					<i :class="icon('ph-smiley icon ph-fw')"></i
					><span class="text">{{ i18n.ts.customEmojis }}</span>
				</MkA>
				<button
					v-click-anime
					v-tooltip.noDelay.right="i18n.ts.more"
					class="item _button"
					@click="more"
				>
					<i :class="icon('ph-dots-three-outline ph-dir icon ph-fw')"></i
					><span class="text">{{ i18n.ts.more }}</span>
					<span v-if="otherMenuItemIndicated" class="indicator"
						><i class="icon ph-circle ph-fill"></i
					></span>
				</button>
				<MkA
					v-click-anime
					v-tooltip.noDelay.right="i18n.ts.settings"
					class="item _button"
					active-class="active"
					to="/settings"
				>
					<i :class="icon('ph-gear icon ph-fw')"></i
					><span class="text">{{ i18n.ts.settings }}</span>
				</MkA>
			</nav>
			<div class="bottom">
				<button
					v-tooltip.noDelay.right="i18n.ts.toPost"
					class="item _button post"
					data-cy-open-post-form
					@click="os.post"
				>
					<i :class="icon('icon ph-pencil ph-fw ph-lg')"></i
					><span class="text">{{ i18n.ts.toPost }}</span>
				</button>
				<button
					v-tooltip.noDelay.right="i18n.ts.help"
					class="item _button help"
					@click="openHelpMenu"
				>
					<i
						:class="icon('help icon ph-info ph-xl ph-fw', false)"
					></i>
				</button>
			</div>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from "vue";
import * as os from "@/os";
import { navbarItemDef } from "@/navbar";
import { openAccountMenu as openAccountMenu_ } from "@/account";
import { isAdmin, isModerator, me } from "@/me";
import { openHelpMenu_ } from "@/scripts/helpMenu";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { getInstanceInfo } from "@/instance";
import { version } from "@/config";
import icon from "@/scripts/icon";

const isEmpty = (x: string | null) => x == null || x === "";

const iconOnly = ref(false);

const menu = computed(() => defaultStore.state.menu);
const otherMenuItemIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (menu.value.includes(def)) continue;
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});

const calcViewState = () => {
	iconOnly.value =
		window.innerWidth <= 1279 || defaultStore.state.menuDisplay === "sideIcon";
};

calcViewState();

matchMedia("(max-inline-size: 1279px)").onchange = (mql) => calcViewState();

watch(defaultStore.reactiveState.menuDisplay, () => {
	calcViewState();
});

const {
	maintainerName,
	maintainerEmail,
	disableRegistration,
	enableHcaptcha,
	enableRecaptcha,
	enableEmail,
} = getInstanceInfo();

const noMaintainerInformation =
	isEmpty(maintainerName) || isEmpty(maintainerEmail);
const noBotProtection =
	!disableRegistration && !enableHcaptcha && !enableRecaptcha;
const noEmailServer = !enableEmail;
const thereIsUnresolvedAbuseReport = ref(false);
const updateAvailable = ref(false);

if (isAdmin) {
	os.api("admin/abuse-user-reports", {
		state: "unresolved",
		limit: 1,
	}).then((reports) => {
		if (reports?.length > 0) thereIsUnresolvedAbuseReport.value = true;
	});
}

if (defaultStore.state.showAdminUpdates) {
	os.api("latest-version").then((res) => {
		updateAvailable.value = version < res?.latest_version;
	});
}

function openAccountMenu(ev: MouseEvent) {
	openAccountMenu_(
		{
			withExtraOperation: true,
		},
		ev,
	);
}

function openHelpMenu(ev: MouseEvent) {
	openHelpMenu_(ev);
}

function more(ev: MouseEvent) {
	os.popup(
		defineAsyncComponent(() => import("@/components/MkLaunchPad.vue")),
		{
			src: ev.currentTarget ?? ev.target,
		},
		{},
		"closed",
	);
}
</script>

<style lang="scss" scoped>
.mvcprjjd {
	$nav-width: 250px;
	$nav-icon-only-width: 80px;
	flex: 0 0 $nav-width;
	inline-size: $nav-width;
	box-sizing: border-box;

	> .body {
		position: sticky;
		inset-block-start: 0;
		inline-size: $nav-icon-only-width;
			block-size: 100dvb;
		box-sizing: border-box;
		overflow: auto;
		overflow-x: clip;
		overflow-inline: clip;
		contain: strict;
		display: flex;
		flex-direction: column;
		
		@supports not (overflow-inline: clip) {
			.vertical-lr &, .vertical-rl & {
				overflow-x: auto;
				overflow-y: clip;
			}
		}

		#firefish_app > :not(.wallpaper) & {
			background: var(--navBg);
		}
		#firefish_app > .wallpaper:not(.centered) & {
			border-inline-end: 1px solid var(--divider);
		}
	}

	&:not(.iconOnly) {
		> .body {
			margin-inline-start: -200px;
			padding-inline-start: 200px;
			box-sizing: content-box;
			inline-size: $nav-width;

			> .top {
				position: relative;
				z-index: 1;
				padding-block: 2rem;
				padding-inline: 0;
				> .banner {
					position: absolute;
					inset-block-start: 0;
					inset-inline-start: 0;
					inline-size: 100%;
					block-size: 100%;
					background-size: cover;
					background-position: center center;
					-webkit-mask-image: linear-gradient(var(--gradient));
					mask-image: linear-gradient(var(--gradient));
				}

				> .account {
					position: relative;
					display: block;
					text-align: center;
					inline-size: 100%;

					> .icon {
						display: inline-block;
						inline-size: 55px;
						aspect-ratio: 1;
					}
				}
			}

			> .bottom {
				padding-block: 20px;
				padding-inline: 0;

				> .post {
					position: relative;
					inline-size: 100%;
					block-size: 40px;
					color: var(--fgOnAccent);
					font-weight: bold;
					text-align: start;
					display: flex;
					align-items: center;

					&:before {
						content: "";
						display: block;
						inline-size: calc(100% - 38px);
						block-size: 100%;
						margin: auto;
						position: absolute;
						inset: 0;
						border-radius: 999px;
						background: linear-gradient(
							var(--gradient-to-inline-end),
							var(--buttonGradateA),
							var(--buttonGradateB)
						);
					}

					&:hover,
					&:focus-within,
					&.active {
						&:before {
							background: var(--accentLighten);
							transition: all 0.4s ease;
						}
					}

					> .icon,
					> .text {
						position: relative;
						inset-inline-start: 3rem;
						color: var(--fgOnAccent);
						transform: translateY(0em);
					}

					> .text {
						margin-inline-start: 1rem;
					}
				}

				> .instance {
					position: relative;
					display: block;
					text-align: center;
					inline-size: 100%;

					> .icon {
						display: inline-block;
						inline-size: 32px !important;
						aspect-ratio: 1;
						margin-block-start: 1rem;
					}
				}

				> .help {
					position: relative;
					display: block;
					text-align: center;
					inline-size: 100%;
					margin-block-start: 1rem;
					color: var(--navFg);

					> .icon {
						display: inline-block;
						inline-size: 38px;
						aspect-ratio: 1;
					}
				}
			}

			> .middle {
				flex: 0.1;

				> .divider {
					margin-block: 16px;
					margin-inline: 16px;
					border-block-start: solid 0.5px var(--divider);
				}

				> .item {
					position: relative;
					display: flex;
					align-items: center;
					padding-inline-start: 30px;
					line-height: 2.85rem;
					margin-block-end: 0.5rem;
					white-space: nowrap;
					inline-size: 100%;
					text-align: start;
					box-sizing: border-box;
					color: var(--navFg);

					> .icon {
						position: relative;
						inline-size: 32px;
						margin-inline-end: 8px;
					}

					> .indicator {
						position: absolute;
						inset-block-start: 0;
						inset-inline-start: 20px;
						color: var(--navIndicator);
						font-size: 8px;
						animation: blink 1s infinite;
					}

					> .text {
						position: relative;
						font-size: 0.9em;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					&:hover,
					&:focus-within {
						text-decoration: none;
						color: var(--navHoverFg);
						transition: all 0.4s ease;
					}

					&.active {
						color: var(--navActive);
					}

					&:hover,
					&:focus-within,
					&.active {
						color: var(--accent);
						transition: all 0.4s ease;

						&:before {
							content: "";
							display: block;
							inline-size: calc(100% - 34px);
							block-size: 100%;
							margin: auto;
							position: absolute;
							inset: 0;
							border-radius: 999px;
							background: var(--accentedBg);
						}
					}
				}
			}
		}
	}

	&.iconOnly {
		flex: 0 0 $nav-icon-only-width;
		inline-size: $nav-icon-only-width;

		> .body {
			inline-size: $nav-icon-only-width;

			> .top {
				padding-block: 2rem;
				padding-inline: 0;

				> .account {
					display: block;
					text-align: center;
					inline-size: 100%;

					> .icon {
						display: inline-block;
						inline-size: 40px;
						aspect-ratio: 1;
						transform: translateY(0em);
					}
				}
			}

			> .bottom {
				padding-block: 20px;
				padding-inline: 0;

				> .post {
					display: block;
					position: relative;
					inline-size: 100%;
					block-size: 52px;
					margin-block-end: 16px;
					text-align: center;

					&:before {
						content: "";
						display: block;
						position: absolute;
						inset: 0;
						margin: auto;
						inline-size: 52px;
						aspect-ratio: 1/1;
						border-radius: 100%;
						background: linear-gradient(
							var(--gradient-to-inline-end),
							var(--buttonGradateA),
							var(--buttonGradateB)
						);
					}

					&:hover,
					&:focus-within,
					&.active {
						&:before {
							background: var(--accentLighten);
							transition: all 0.4s ease;
						}
					}

					> .icon {
						position: relative;
						color: var(--fgOnAccent);
					}

					> .text {
						display: none;
					}
				}

				> .help {
					position: relative;
					display: block;
					text-align: center;
					inline-size: 100%;
					margin-block-start: 1rem;
					color: var(--navFg);

					> .icon {
						display: inline-block;
						inline-size: 38px;
						aspect-ratio: 1;
					}
				}

				> .instance {
					position: relative;
					display: block;
					text-align: center;
					inline-size: 100%;

					> .icon {
						display: inline-block;
						inline-size: 32px !important;
						aspect-ratio: 1;
					}
				}
			}

			> .middle {
				flex: 0.1;

				> .divider {
					margin-block: 8px;
					margin-inline: auto;
					inline-size: calc(100% - 32px);
					border-block-start: solid 0.5px var(--divider);
				}

				> .item {
					display: block;
					position: relative;
					padding-block: 1.1rem;
					padding-inline: 0;
					margin-block-end: 0.2rem;
					inline-size: 100%;
					text-align: center;

					> .icon {
						display: block;
						margin-block: 0;
						margin-inline: auto;
						opacity: 0.7;
						transform: translateY(0em);
					}

					> .text {
						display: none;
					}

					> .indicator {
						position: absolute;
						inset-block-start: 6px;
						inset-inline-start: 24px;
						color: var(--navIndicator);
						font-size: 8px;
						animation: blink 1s infinite;
					}

					&:hover,
					&:focus-within,
					&.active {
						text-decoration: none;
						color: var(--accent);
						transition: all 0.4s ease;

						&:before {
							content: "";
							display: block;
							block-size: 100%;
							aspect-ratio: 1;
							margin: auto;
							position: absolute;
							inset: 0;
							border-radius: 999px;
							background: var(--accentedBg);
						}

						> .icon,
						> .text {
							opacity: 1;
						}
					}
				}
			}
		}
	}

	.item {
		outline: none;
		&:focus-visible:before {
			outline: auto;
		}
	}
}
</style>
