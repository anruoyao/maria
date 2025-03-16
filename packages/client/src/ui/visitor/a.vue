<template>
	<div class="mk-app">
		<div
			v-if="mainRouter.currentRoute?.name === 'index'"
			class="banner"
			:style="{ backgroundImage: `url(${bannerUrl})` }"
		>
			<div>
				<h1 v-if="meta">
					<img
						v-if="meta.logoImageUrl"
						class="logo"
						:src="meta.logoImageUrl"
					/><span v-else class="text">{{ instanceName }}</span>
				</h1>
				<div v-if="meta" class="about">
					<div
						class="desc"
						v-html="meta.description || i18n.ts.introFirefish"
					></div>
				</div>
				<div class="action">
					<button class="_button primary" @click="signup()">
						{{ i18n.ts.signup }}
					</button>
					<button class="_button" @click="signin()">
						{{ i18n.ts.login }}
					</button>
				</div>
			</div>
		</div>
		<div
			v-else
			class="banner-mini"
			:style="{ backgroundImage: `url(${bannerUrl})` }"
		>
			<div>
				<h1 v-if="meta">
					<img
						v-if="meta.logoImageUrl"
						class="logo"
						:src="meta.logoImageUrl"
					/><span v-else class="text">{{ instanceName }}</span>
				</h1>
			</div>
		</div>

		<div class="main">
			<div ref="contents" class="contents" :class="{ wallpaper }">
				<header
					v-show="mainRouter.currentRoute?.name !== 'index'"
					ref="header"
					class="header"
				>
					<XHeader :info="pageInfo" />
				</header>
				<main ref="main">
					<RouterView />
				</main>
				<div class="powered-by">
					<b
						><MkA to="/">{{ host }}</MkA></b
					>
					<small
						>Powered by
						<a
							href="https://codeberg.org/firefish/firefish"
							target="_blank"
							>Firefish</a
						></small
					>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import XHeader from "./header.vue";
import { host, instanceName } from "@/config";
import { search } from "@/scripts/search";
import * as os from "@/os";
import MkPagination from "@/components/MkPagination.vue";
import MkButton from "@/components/MkButton.vue";
import { ColdDeviceStorage, defaultStore } from "@/store";
import { mainRouter } from "@/router";
import { i18n } from "@/i18n";
import { getInstanceInfo } from "@/instance";

const DESKTOP_THRESHOLD = 1100;

export default defineComponent({
	components: {
		XHeader,
		MkPagination,
		MkButton,
	},

	data() {
		return {
			host,
			instanceName,
			pageInfo: null,
			meta: null,
			narrow: window.innerWidth < 1280,
			announcements: {
				endpoint: "announcements",
				limit: 10,
			},
			mainRouter,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			i18n,
			bannerUrl: getInstanceInfo().bannerUrl,
		};
	},

	computed: {
		keymap(): any {
			return {
				d: () => {
					if (ColdDeviceStorage.get("syncDeviceDarkMode")) return;
					defaultStore.set("darkMode", !defaultStore.state.darkMode);
				},
				s: search,
			};
		},
	},

	created() {
		document.documentElement.style.overflowBlock = "scroll";

		os.api("meta", { detail: true }).then((meta) => {
			this.meta = meta;
		});
	},

	mounted() {
		if (!this.isDesktop) {
			window.addEventListener(
				"resize",
				() => {
					if (window.innerWidth >= DESKTOP_THRESHOLD) this.isDesktop = true;
				},
				{ passive: true },
			);
		}
	},

	methods: {
		changePage(page) {
			if (page == null) return;

			if (page[symbols.PAGE_INFO]) {
				this.pageInfo = page[symbols.PAGE_INFO];
			}
		},

		top() {
			window.scroll({ top: 0, behavior: "smooth" });
		},
	},
});
</script>

<style lang="scss" scoped>
.mk-app {
	min-block-size: 100vb;

	> .banner {
		position: relative;
		inline-size: 100%;
		text-align: center;
		background-position: center;
		background-size: cover;

		> div {
			block-size: 100%;
			background: rgba(0, 0, 0, 0.3);

			* {
				color: #fff;
			}

			> h1 {
				margin: 0;
				padding-block-start: 96px;
				padding-inline-end: 32px;
				padding-block-end: 0;
				padding-inline-start: 32px;
				text-shadow: 0 0 8px black;

				> .logo {
					vertical-align: bottom;
					max-block-size: 150px;
				}
			}

			> .about {
				padding: 32px;
				max-inline-size: 580px;
				margin-block: 0;
				margin-inline: auto;
				box-sizing: border-box;
				text-shadow: 0 0 8px black;
			}

			> .action {
				padding-block-end: 64px;

				> button {
					display: inline-block;
					padding-block: 10px;
					padding-inline: 20px;
					box-sizing: border-box;
					text-align: center;
					border-radius: 999px;
					background: var(--panel);
					color: var(--fg);

					&.primary {
						background: var(--accent);
						color: #fff;
					}

					&:first-child {
						margin-inline-end: 16px;
					}
				}
			}
		}
	}

	> .banner-mini {
		position: relative;
		inline-size: 100%;
		text-align: center;
		background-position: center;
		background-size: cover;

		> div {
			position: relative;
			z-index: 1;
			block-size: 100%;
			background: rgba(0, 0, 0, 0.3);

			* {
				color: #fff !important;
			}

			> header {
			}

			> h1 {
				margin: 0;
				padding: 32px;
				text-shadow: 0 0 8px black;

				> .logo {
					vertical-align: bottom;
					max-block-size: 100px;
				}
			}
		}
	}

	> .main {
		> .contents {
			position: relative;
			z-index: 1;

			> .header {
				position: sticky;
				inset-block-start: 0;
				inset-inline-start: 0;
				z-index: 1000;
			}

			> .powered-by {
				padding: 28px;
				font-size: 14px;
				text-align: center;
				border-block-start: 1px solid var(--divider);

				> small {
					display: block;
					margin-block-start: 8px;
					opacity: 0.5;
				}
			}
		}
	}
}
</style>

<style lang="scss"></style>
