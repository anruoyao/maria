<template>
	<div
		class="rwqkcmrc"
		:style="{
			backgroundImage: transparent
				? 'none'
				: `url(${backgroundImageUrl})`,
		}"
	>
		<div class="back" :class="{ transparent }"></div>
		<div class="contents">
			<div class="wrapper">
				<h1 v-if="meta" :class="{ full }">
					<MkA to="/" class="link"
						><img
							v-if="meta.logoImageUrl"
							class="logo"
							:src="meta.logoImageUrl"
							alt="logo"
						/><span v-else class="text">{{
							instanceName
						}}</span></MkA
					>
				</h1>
				<template v-if="full">
					<div v-if="meta" class="about">
						<div
							class="desc"
							v-html="meta.description || i18n.ts.introFirefish"
						></div>
					</div>
					<div class="action">
						<button class="_buttonPrimary" @click="signup()">
							{{ i18n.ts.signup }}
						</button>
						<button class="_button" @click="signin()">
							{{ i18n.ts.login }}
						</button>
					</div>
					<div class="announcements panel">
						<header>{{ i18n.ts.announcements }}</header>
						<MkPagination
							v-slot="{ items }"
							:pagination="announcements"
							class="list"
						>
							<section
								v-for="announcement in items"
								:key="announcement.id"
								class="item"
							>
								<div class="title">
									{{ announcement.title }}
								</div>
								<div class="content">
									<Mfm :text="announcement.text" />
									<img
										v-if="announcement.imageUrl"
										:src="announcement.imageUrl"
										alt="announcement image"
									/>
								</div>
							</section>
						</MkPagination>
					</div>
					<div v-if="poweredBy" class="powered-by">
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
				</template>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { host, instanceName } from "@/config";
import * as os from "@/os";
import MkPagination from "@/components/MkPagination.vue";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import { getInstanceInfo } from "@/instance";

export default defineComponent({
	components: {
		MkPagination,
		MkButton,
	},

	props: {
		full: {
			type: Boolean,
			required: false,
			default: false,
		},
		transparent: {
			type: Boolean,
			required: false,
			default: false,
		},
		poweredBy: {
			type: Boolean,
			required: false,
			default: false,
		},
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
			i18n,
			backgroundImageUrl: getInstanceInfo().backgroundImageUrl,
		};
	},

	created() {
		os.api("meta", { detail: true }).then((meta) => {
			this.meta = meta;
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
	},
});
</script>

<style lang="scss" scoped>
.rwqkcmrc {
	position: relative;
	text-align: center;
	background-position: center;
	background-size: cover;
	// TODO: パララックスにしたい

	> .back {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 100%;
		block-size: 100%;
		background: rgba(0, 0, 0, 0.3);

		&.transparent {
			-webkit-backdrop-filter: var(--blur, blur(12px));
			backdrop-filter: var(--blur, blur(12px));
		}
	}

	> .contents {
		position: relative;
		z-index: 1;
		block-size: inherit;
		overflow: auto;

		> .wrapper {
			max-inline-size: 380px;
			padding-block: 0;
			padding-inline: 16px;
			box-sizing: border-box;
			margin-block: 0;
			margin-inline: auto;

			> .panel {
				-webkit-backdrop-filter: var(--blur, blur(8px));
				backdrop-filter: var(--blur, blur(8px));
				background: rgba(0, 0, 0, 0.5);
				border-radius: var(--radius);

				&,
				* {
					color: #fff !important;
				}
			}

			> h1 {
				display: block;
				margin: 0;
				padding-block-start: 32px;
				padding-inline-end: 0;
				padding-block-end: 32px;
				padding-inline-start: 0;
				color: #fff;

				&.full {
					padding-block-start: 64px;
					padding-inline-end: 0;
					padding-block-end: 0;
					padding-inline-start: 0;

					> .link {
						> ::v-deep(.logo) {
							max-block-size: 130px;
						}
					}
				}

				> .link {
					display: block;

					> ::v-deep(.logo) {
						vertical-align: bottom;
						max-block-size: 100px;
					}
				}
			}

			> .about {
				display: block;
				margin-block: 24px;
				margin-inline: 0;
				text-align: center;
				box-sizing: border-box;
				text-shadow: 0 0 8px black;
				color: #fff;
			}

			> .action {
				> button {
					display: block;
					inline-size: 100%;
					padding: 10px;
					box-sizing: border-box;
					text-align: center;
					border-radius: 999px;

					&._button {
						background: var(--panel);
					}

					&:first-child {
						margin-block-end: 16px;
					}
				}
			}

			> .announcements {
				margin-block: 32px;
				margin-inline: 0;
				text-align: start;

				> header {
					padding-block: 12px;
					padding-inline: 16px;
					border-block-end: solid 1px rgba(255, 255, 255, 0.5);
				}

				> .list {
					max-block-size: 300px;
					overflow: auto;

					> .item {
						padding-block: 12px;
						padding-inline: 16px;

						& + .item {
							border-block-start: solid 1px rgba(255, 255, 255, 0.5);
						}

						> .title {
							font-weight: bold;
						}

						> .content {
							> img {
								max-inline-size: 100%;
							}
						}
					}
				}
			}

			> .powered-by {
				padding: 28px;
				font-size: 14px;
				text-align: center;
				border-block-start: 1px solid rgba(255, 255, 255, 0.5);
				color: #fff;

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
