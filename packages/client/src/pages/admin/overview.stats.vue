<template>
	<div>
		<Transition
			:name="defaultStore.state.animation ? '_transition_zoom' : ''"
			mode="out-in"
		>
			<MkLoading v-if="fetching" />
			<div v-else :class="$style.root">
				<div class="item _panel users">
					<div class="icon">
						<i :class="icon('ph-users ph-xl', false)"></i>
					</div>
					<div class="body">
						<div class="value">
							<MkNumber
								:value="stats.originalUsersCount"
								style="margin-inline-end: 0.5em"
							/>
						</div>
						<div class="label">{{ i18n.ts.users }}</div>
					</div>
				</div>
				<div class="item _panel notes">
					<div class="icon">
						<i :class="icon('ph-pencil ph-xl', false)"></i>
					</div>
					<div class="body">
						<div class="value">
							<MkNumber
								:value="stats.originalNotesCount"
								style="margin-inline-end: 0.5em"
							/>
						</div>
						<div class="label">{{ i18n.ts.notes }}</div>
					</div>
				</div>
				<div class="item _panel instances">
					<div class="icon">
						<i :class="icon('ph-planet ph-xl', false)"></i>
					</div>
					<div class="body">
						<div class="value">
							<MkNumber
								:value="stats.instances"
								style="margin-inline-end: 0.5em"
							/>
						</div>
						<div class="label">{{ i18n.ts.instances }}</div>
					</div>
				</div>
				<div class="item _panel online">
					<div class="icon">
						<i :class="icon('ph-broadcast ph-xl', false)"></i>
					</div>
					<div class="body">
						<div class="value">
							<MkNumber
								:value="onlineUsersCount"
								style="margin-inline-end: 0.5em"
							/>
						</div>
						<div class="label">{{ i18n.ts.online }}</div>
					</div>
				</div>
				<div class="item _panel emojis">
					<div class="icon">
						<i :class="icon('ph-smiley ph-xl', false)"></i>
					</div>
					<div class="body">
						<div class="value">
							<MkNumber
								:value="emojiCount"
								style="margin-inline-end: 0.5em"
							/>
						</div>
						<div class="label">{{ i18n.ts.emojis }}</div>
					</div>
				</div>
			</div>

			<!-- TODO: Drive -->
		</Transition>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import * as os from "@/os";
import MkNumber from "@/components/MkNumber.vue";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const stats = ref(null);
const onlineUsersCount = ref(0);
const emojiCount = ref(0);
const fetching = ref(true);

onMounted(async () => {
	const [_stats, _onlineUsersCount] = await Promise.all([
		os.api("stats", {}),
		os.api("get-online-users-count").then((res) => res.count),
	]);
	stats.value = _stats;
	onlineUsersCount.value = _onlineUsersCount;

	os.api("meta", { detail: false }).then((meta) => {
		emojiCount.value = meta.emojis.length;
	});

	fetching.value = false;
});
</script>

<style lang="scss" module>
.root {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
	grid-gap: 12px;

	&:global {
		> .item {
			display: flex;
			box-sizing: border-box;
			padding: 12px;

			> .icon {
				display: grid;
				place-items: center;
				block-size: 100%;
				aspect-ratio: 1;
				margin-inline-end: 12px;
				background: var(--accentedBg);
				color: var(--accent);
				border-radius: 10px;
			}

			&.users {
				> .icon {
					background: #56949f22;
					color: #9ccfd8;
				}
			}

			&.notes {
				> .icon {
					background: #28698322;
					color: #31748f;
				}
			}

			&.instances {
				> .icon {
					background: #d7827e22;
					color: #ebbcba;
				}
			}

			&.emojis {
				> .icon {
					background: #ea9d3422;
					color: #f6c177;
				}
			}

			&.online {
				> .icon {
					background: #907aa922;
					color: #c4a7e7;
				}
			}

			&.drive {
				> .icon {
					background: #b4637a22;
					color: #eb6f92;
				}
			}

			> .body {
				padding-block: 2px;
				padding-inline: 0;

				> .value {
					font-size: 1.2em;
					font-weight: bold;

					> .diff {
						font-size: 0.65em;
						font-weight: normal;
					}
				}

				> .label {
					font-size: 0.8em;
					opacity: 0.5;
				}
			}
		}
	}
}
</style>
