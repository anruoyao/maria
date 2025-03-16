<template>
	<MkA :to="`/channels/${channel.id}`" class="eftoefju _panel" tabindex="-1">
		<div class="banner" :style="bannerStyle">
			<div class="fade"></div>
			<div class="name">
				<i :class="icon('ph-television')"></i>
				{{ channel.name }}
			</div>
			<div class="status">
				<div>
					<i :class="icon('ph-users ph-fw')"></i>
					<I18n
						:src="i18n.ts._channel.usersCount"
						tag="span"
						style="margin-inline-start: 4px"
					>
						<template #n>
							<b>{{ channel.usersCount }}</b>
						</template>
					</I18n>
				</div>
				<div>
					<i :class="icon('ph-pencil ph-fw')"></i>
					<I18n
						:src="i18n.ts._channel.notesCount"
						tag="span"
						style="margin-inline-start: 4px"
					>
						<template #n>
							<b>{{ channel.notesCount }}</b>
						</template>
					</I18n>
				</div>
			</div>
		</div>
		<article v-if="channel.description">
			<p :title="channel.description">
				{{
					channel.description.length > 85
						? channel.description.slice(0, 85) + "…"
						: channel.description
				}}
			</p>
		</article>
		<footer>
			<span v-if="channel.lastNotedAt">
				{{ i18n.ts.updatedAt }}: <MkTime :time="channel.lastNotedAt" />
			</span>
		</footer>
	</MkA>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { entities } from "firefish-js";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const props = defineProps<{
	channel: entities.Channel;
}>();

const bannerStyle = computed(() => {
	if (props.channel.bannerUrl) {
		return { backgroundImage: `url(${props.channel.bannerUrl})` };
	} else {
		return { backgroundColor: "#4c5e6d" };
	}
});
</script>

<style lang="scss" scoped>
.eftoefju {
	display: block;
	overflow: hidden;
	inline-size: 100%;

	&:hover {
		text-decoration: none;
	}

	> .banner {
		position: relative;
		inline-size: 100%;
		block-size: 200px;
		background-position: center;
		background-size: cover;

		> .fade {
			position: absolute;
			inset-block-end: 0;
			inset-inline-start: 0;
			inline-size: 100%;
			block-size: 64px;
			background: linear-gradient(var(--gradient-to-block-start), var(--panel), var(--X15));
		}

		> .name {
			position: absolute;
			inset-block-start: 16px;
			inset-inline-start: 16px;
			padding-block: 12px;
			padding-inline: 16px;
			-webkit-backdrop-filter: var(--blur, blur(8px));
			backdrop-filter: var(--blur, blur(8px));
			background: rgba(0, 0, 0, 0.2);
			color: #fff;
			font-size: 1.2em;
			border-radius: 999px;
		}

		> .status {
			position: absolute;
			z-index: 1;
			inset-block-end: 16px;
			inset-inline-end: 16px;
			padding-block: 8px;
			padding-inline: 12px;
			font-size: 80%;
			-webkit-backdrop-filter: var(--blur, blur(8px));
			backdrop-filter: var(--blur, blur(8px));
			background: rgba(0, 0, 0, 0.2);
			border-radius: 6px;
			color: #fff;
		}
	}

	> article {
		padding: 16px;

		> p {
			margin: 0;
			font-size: 1em;
		}
	}

	> footer {
		padding-block: 12px;
		padding-inline: 16px;
		border-block-start: solid 0.5px var(--divider);

		> span {
			opacity: 0.7;
			font-size: 0.9em;
		}
	}

	@media (max-inline-size: 550px) {
		font-size: 0.9em;

		> .banner {
			block-size: 80px;

			> .status {
				display: none;
			}
		}

		> article {
			padding: 12px;
		}

		> footer {
			display: none;
		}
	}

	@media (max-inline-size: 500px) {
		font-size: 0.8em;

		> .banner {
			block-size: 70px;
		}

		> article {
			padding: 8px;
		}
	}
}
</style>
