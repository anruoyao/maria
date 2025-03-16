<template>
	<nav class="rrevdjwu" :class="{ grid }">
		<section v-for="group in def" class="group">
			<div v-if="group.title" class="title">{{ group.title }}</div>

			<div class="items">
				<template v-for="item in group.items">
					<a
						v-if="item.type === 'a'"
						:href="item.href"
						:target="item.target"
						class="_button item"
						:class="{ danger: item.danger, active: item.active }"
					>
						<i
							v-if="item.icon"
							class="icon ph-fw ph-lg"
							:class="item.icon"
						></i>
						<span class="text">{{ item.text }}</span>
					</a>
					<button
						v-else-if="item.type === 'button'"
						class="_button item"
						:class="{ danger: item.danger, active: item.active }"
						:disabled="item.active"
						@click="(ev) => item.action(ev)"
					>
						<i
							v-if="item.icon"
							class="icon ph-fw ph-lg"
							:class="item.icon"
						></i>
						<span class="text">{{ item.text }}</span>
					</button>
					<MkA
						v-else
						:to="item.to"
						class="_button item"
						:class="{ danger: item.danger, active: item.active }"
					>
						<i
							v-if="item.icon"
							class="icon ph-fw ph-lg"
							:class="item.icon"
						></i>
						<span class="text">{{ item.text }}</span>
					</MkA>
				</template>
			</div>
		</section>
	</nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	props: {
		def: {
			type: Array,
			required: true,
		},
		grid: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
});
</script>

<style lang="scss" scoped>
.rrevdjwu {
	> .group {
		& + .group {
			margin-block-start: 16px;
			padding-block-start: 16px;
			border-block-start: solid 0.5px var(--divider);
		}

		> .title {
			opacity: 0.7;
			margin-block-start: 0;
			margin-inline: 12px;
			margin-block-end: 8px;
			font-size: 0.9em;
		}

		> .items {
			> .item {
				display: flex;
				align-items: center;
				inline-size: 100%;
				box-sizing: border-box;
				padding-block-start: 10px;
				padding-inline-end: 16px;
				padding-block-end: 10px;
				padding-inline-start: 8px;
				border-radius: 9px;
				font-size: 0.9em;
				margin-block-end: 0.3rem;

				&:hover,
				&:focus-visible {
					text-decoration: none;
					background: var(--panelHighlight);
				}

				&.active {
					color: var(--accent);
					background: var(--accentedBg);
				}

				&.danger {
					color: var(--error);
				}

				> .icon {
					inline-size: 32px;
					margin-inline-end: 2px;
					flex-shrink: 0;
					text-align: center;
					opacity: 0.8;
				}

				> .text {
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					padding-inline-end: 12px;
				}
			}
		}
	}

	&.grid {
		> .group {
			margin-inline-start: 0;
			margin-inline-end: 0;

			& + .group {
				padding-block-start: 0;
				border-block-start: none;
			}

			> .title {
				font-size: 1em;
				opacity: 0.7;
				margin-block-start: 0;
				margin-inline-end: 0;
				margin-block-end: 8px;
				margin-inline-start: 16px;
			}

			> .items {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
				grid-gap: 8px;
				padding-block: 0;
				padding-inline: 16px;

				> .item {
					flex-direction: column;
					padding-block-start: 18px;
					padding-inline-end: 16px;
					padding-block-end: 16px;
					padding-inline-start: 16px;
					background: var(--panel);
					border-radius: 8px;
					text-align: center;

					> .icon {
						display: block;
						margin-inline-end: 0;
						margin-block-end: 12px;
						font-size: 1.5em;
					}

					> .text {
						padding-inline-end: 0;
						inline-size: 100%;
						font-size: 0.8em;
					}
				}
			}
		}
	}
}
</style>
