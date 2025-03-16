<template>
	<div v-if="meta" class="rsqzvsbo">
		<div class="top">
			<MkFeaturedPhotos class="bg" />
			<div class="fade"></div>
			<div class="emojis">
				<MkEmoji :normal="true" :no-style="true" emoji="👍" />
				<MkEmoji :normal="true" :no-style="true" emoji="❤" />
				<MkEmoji :normal="true" :no-style="true" emoji="😆" />
				<MkEmoji :normal="true" :no-style="true" emoji="🎉" />
				<MkEmoji :normal="true" :no-style="true" emoji="🍮" />
			</div>
			<div class="main">
				<img src="/client-assets/misskey.svg" class="misskey" />
				<div class="form _panel">
					<div class="bg">
						<div class="fade"></div>
					</div>
					<div class="fg">
						<h1>
							<img
								v-if="meta.logoImageUrl"
								class="logo"
								:src="meta.logoImageUrl"
							/><span v-else class="text">{{
								instanceName
							}}</span>
						</h1>
						<div class="about">
							<div
								class="desc"
								v-html="
									meta.description || i18n.ts.headlineFirefish
								"
							></div>
						</div>
						<div class="action">
							<MkButton inline gradate @click="signup()">{{
								i18n.ts.signup
							}}</MkButton>
							<MkButton inline @click="signin()">{{
								i18n.ts.login
							}}</MkButton>
						</div>
						<div v-if="onlineUsersCount && stats" class="status">
							<div>
								<I18n
									:src="i18n.ts.nUsers"
									text-tag="span"
									class="users"
								>
									<template #n
										><b>{{
											number(stats.originalUsersCount)
										}}</b></template
									>
								</I18n>
								<I18n
									:src="i18n.ts.nNotes"
									text-tag="span"
									class="notes"
								>
									<template #n
										><b>{{
											number(stats.originalNotesCount)
										}}</b></template
									>
								</I18n>
							</div>
							<I18n
								:src="i18n.ts.onlineUsersCount"
								text-tag="span"
								class="online"
							>
								<template #n
									><b>{{ onlineUsersCount }}</b></template
								>
							</I18n>
						</div>
						<button class="_button _acrylic menu" @click="showMenu">
							<i :class="icon('ph-dots-three-outline ph-dir')"></i>
						</button>
					</div>
				</div>
				<nav class="nav">
					<MkA to="/announcements">{{ i18n.ts.announcements }}</MkA>
					<MkA to="/explore">{{ i18n.ts.explore }}</MkA>
					<MkA to="/channels">{{ i18n.ts.channel }}</MkA>
					<MkA to="/featured">{{ i18n.ts.featured }}</MkA>
				</nav>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { toUnicode } from "punycode/";
import XTimeline from "./welcome.timeline.vue";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkButton from "@/components/MkButton.vue";
import XNote from "@/components/MkNote.vue";
import MkFeaturedPhotos from "@/components/MkFeaturedPhotos.vue";
import { host, instanceName } from "@/config";
import * as os from "@/os";
import number from "@/filters/number";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

export default defineComponent({
	components: {
		MkButton,
		XNote,
		MkFeaturedPhotos,
		XTimeline,
	},

	data() {
		return {
			host: toUnicode(host),
			instanceName,
			meta: null,
			stats: null,
			tags: [],
			onlineUsersCount: null,
			i18n,
		};
	},

	created() {
		os.api("meta", { detail: true }).then((meta) => {
			this.meta = meta;
		});

		os.api("stats").then((stats) => {
			this.stats = stats;
		});

		os.api("get-online-users-count").then((res) => {
			this.onlineUsersCount = res.count;
		});

		os.api("hashtags/list", {
			sort: "+mentionedLocalUsers",
			limit: 8,
		}).then((tags) => {
			this.tags = tags;
		});
	},

	methods: {
		signin() {
			os.popup(
				XSigninDialog,
				{
					autoSet: true,
				},
				{},
				"closed",
			);
		},

		signup() {
			os.popup(
				XSignupDialog,
				{
					autoSet: true,
				},
				{},
				"closed",
			);
		},

		showMenu(ev) {
			os.popupMenu(
				[
					{
						text: i18n.t("aboutX", { x: instanceName }),
						icon: `${icon("ph-info")}`,
						action: () => {
							os.pageWindow("/about");
						},
					},
					{
						text: i18n.ts.aboutFirefish,
						icon: `${icon("ph-info")}`,
						action: () => {
							os.pageWindow("/about-firefish");
						},
					},
				],
				ev.currentTarget ?? ev.target,
			);
		},
		number,
	},
});
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	> .top {
		display: flex;
		text-align: center;
		min-block-size: 100vb;
		box-sizing: border-box;
		padding: 16px;

		> .bg {
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: 0;
			inline-size: 100%;
			block-size: 100%;
		}

		> .fade {
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: 0;
			inline-size: 100%;
			block-size: 100%;
			background: rgba(0, 0, 0, 0.25);
		}

		> .emojis {
			position: absolute;
			inset-block-end: 32px;
			inset-inline-start: 35px;

			> * {
				margin-inline-end: 8px;
			}

			@media (max-inline-size: 1200px) {
				display: none;
			}
		}

		> .main {
			position: relative;
			inline-size: min(460px, 100%);
			margin: auto;

			> .misskey {
				inline-size: 150px;
				margin-block-end: 16px;

				@media (max-inline-size: 450px) {
					inline-size: 130px;
				}
			}

			> .form {
				position: relative;
				box-shadow: 0 12px 32px rgb(0 0 0 / 25%);

				> .bg {
					position: absolute;
					inset-block-start: 0;
					inset-inline-start: 0;
					inline-size: 100%;
					block-size: 128px;
					background-position: center;
					background-size: cover;
					opacity: 0.75;

					> .fade {
						position: absolute;
						inset-block-end: 0;
						inset-inline-start: 0;
						inline-size: 100%;
						block-size: 128px;
						background: linear-gradient(
							var(--gradient-to-block-start),
							var(--panel),
							var(--X15)
						);
					}
				}

				> .fg {
					position: relative;
					z-index: 1;

					> h1 {
						display: block;
						margin: 0;
						padding-block-start: 32px;
						padding-inline-end: 32px;
						padding-block-end: 24px;
						padding-inline-start: 32px;

						> .logo {
							vertical-align: bottom;
							max-block-size: 120px;
						}
					}

					> .about {
						padding-block: 0;
						padding-inline: 32px;
					}

					> .action {
						padding: 32px;

						> * {
							line-height: 28px;
						}
					}

					> .status {
						border-block-start: solid 0.5px var(--divider);
						padding: 32px;
						font-size: 90%;

						> div {
							> span:not(:last-child) {
								padding-inline-end: 1em;
								margin-inline-end: 1em;
								border-inline-end: solid 0.5px var(--divider);
							}
						}

						> .online {
							::v-deep(b) {
								color: #41b781;
							}

							::v-deep(span) {
								opacity: 0.7;
							}
						}
					}

					> .menu {
						position: absolute;
						inset-block-start: 16px;
						inset-inline-end: 16px;
						inline-size: 32px;
						block-size: 32px;
						border-radius: 8px;
					}
				}
			}

			> .nav {
				position: relative;
				z-index: 2;
				margin-block-start: 20px;
				color: #fff;
				text-shadow: 0 0 8px black;
				font-size: 0.9em;

				> *:not(:last-child) {
					margin-inline-end: 1.5em;
				}
			}
		}
	}
}
</style>
