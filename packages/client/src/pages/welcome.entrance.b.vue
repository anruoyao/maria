<template>
	<div v-if="meta" class="rsqzvsbo">
		<div class="top">
			<MkFeaturedPhotos class="bg" />
			<XTimeline class="tl" />
			<div class="shape"></div>
			<div class="main">
				<h1>
					<img
						v-if="meta.logoImageUrl"
						class="logo"
						:src="meta.logoImageUrl"
					/><span v-else class="text">{{ instanceName }}</span>
				</h1>
				<div class="about">
					<div
						class="desc"
						v-html="meta.description || i18n.ts.headlineFirefish"
					></div>
				</div>
				<div class="action">
					<MkButton class="signup" inline gradate @click="signup()">{{
						i18n.ts.signup
					}}</MkButton>
					<MkButton class="signin" inline @click="signin()">{{
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
			</div>
			<img src="/client-assets/misskey.svg" class="misskey" />
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
		XTimeline,
		MkFeaturedPhotos,
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
					null,
					{
						text: i18n.ts.help,
						icon: `${icon("ph-question")}`,
						action: () => {
							window.open(`https://misskey-hub.net/help.md`, "_blank");
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
		min-block-size: 100vb;
		box-sizing: border-box;

		> .bg {
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: 0;
			inline-size: 100%;
			block-size: 100%;
		}

		> .tl {
			position: absolute;
			inset-block-start: 0;
			inset-block-end: 0;
			inset-inline-end: 64px;
			margin: auto;
			inline-size: 500px;
			block-size: calc(100% - 128px);
			overflow: hidden;
			-webkit-mask-image: linear-gradient(
				var(--gradient-to-block-start),
				rgba(0, 0, 0, 0) 0%,
				rgba(0, 0, 0, 1) 128px,
				rgba(0, 0, 0, 1) calc(100% - 128px),
				rgba(0, 0, 0, 0) 100%
			);
			mask-image: linear-gradient(
				var(--gradient-to-block-start),
				rgba(0, 0, 0, 0) 0%,
				rgba(0, 0, 0, 1) 128px,
				rgba(0, 0, 0, 1) calc(100% - 128px),
				rgba(0, 0, 0, 0) 100%
			);
		}

		> .shape {
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: 0;
			inline-size: 100%;
			block-size: 100%;
			background: var(--accent);
			clip-path: polygon(0% 0%, 40% 0%, 22% 100%, 0% 100%);
		}

		> .misskey {
			position: absolute;
			inset-block-end: 64px;
			inset-inline-start: 64px;
			inline-size: 160px;
		}

		> .main {
			position: relative;
			inline-size: min(450px, 100%);
			padding: 64px;
			color: #fff;
			font-size: 1.1em;

			@media (max-inline-size: 1200px) {
				margin: auto;
			}

			> h1 {
				display: block;
				margin-block-start: 0;
				margin-inline-end: 0;
				margin-block-end: 32px;
				margin-inline-start: 0;
				padding: 0;

				> .logo {
					vertical-align: bottom;
					max-block-size: 100px;
				}
			}

			> .about {
				padding: 0;
			}

			> .action {
				margin-block: 32px;
				margin-inline: 0;

				> * {
					line-height: 32px;
				}

				> .signup {
					background: var(--panel);
					color: var(--fg);
				}

				> .signin {
					background: var(--accent);
					color: inherit;
				}
			}

			> .status {
				margin-block: 32px;
				margin-inline: 0;
				border-block-start: solid 1px rgba(255, 255, 255, 0.5);
				font-size: 90%;

				> div {
					padding-block: 16px;
					padding-inline: 0;

					> span:not(:last-child) {
						padding-inline-end: 1em;
						margin-inline-end: 1em;
						border-inline-end: solid 1px rgba(255, 255, 255, 0.5);
					}
				}
			}
		}
	}
}
</style>
