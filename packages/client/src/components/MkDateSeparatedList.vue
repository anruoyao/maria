<template>
	<component
		:is="defaultStore.state.animation? TransitionGroup : 'div'"
		tag="div"
		class="sqadhkmv"
		name="list"
		:class="{ noGap }"
		:data-direction = "props.direction"
		:data-reversed = "props.reversed ? 'true' : 'false'"
	>
		<template v-for="(item, index) in items" :key="item.id">
			<slot :item="item"> </slot>
			<div
				v-if="index !== items.length - 1 &&
					new Date(item.createdAt).getDate() !==
					new Date(items[index + 1].createdAt).getDate()"
				class="separator"
			>
				<p class="date">
					<span>
						<i class="icon" :class="icon('ph-caret-up ph-dir')"></i>
						{{ getDateText(item.createdAt) }}
					</span>
					<span>
						{{ getDateText(items[index + 1].createdAt) }}
						<i class="icon" :class="icon('ph-caret-down  ph-dir')"></i>
					</span>
				</p>
			</div>
			<!-- class="a" means advertise -->
			<MkAd
				v-else-if="ad && item._shouldInsertAd_"
				class="a" 
				:prefer="['inline', 'inline-big']"
			/>
		</template>
	</component>
</template>

<script lang="ts" setup generic="T extends Item">
import { TransitionGroup } from "vue";
import MkAd from "@/components/global/MkAd.vue";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

export interface Item {
	id: string;
	createdAt: string;
	_shouldInsertAd_?: boolean;
}

const props = withDefaults(
	defineProps<{
		items: T[];
		direction?: string;
		reversed?: boolean;
		noGap?: boolean;
		ad?: boolean;
	}>(),
	{
		direction: "down",
		reversed: false,
		noGap: false,
		ad: false,
	},
);

const slots = defineSlots<{
	default(props: { item: T }): unknown;
}>();

function getDateText(time: string) {
	const date = new Date(time).getDate();
	const month = new Date(time).getMonth() + 1;
	return i18n.t("monthAndDay", {
		month: month.toString(),
		day: date.toString(),
	});
}
</script>

<style lang="scss">
.sqadhkmv {
	> *:empty {
		display: none;
	}

	&:not(.date-separated-list-nogap) > *:not(:last-child) {
		margin-block-end: var(--margin);
	}

	> .list-move {
		transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
	}

	> .list-enter-active {
		transition:
			transform 0.7s cubic-bezier(0.23, 1, 0.32, 1),
			opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1);
	}

	&[data-direction="up"] {
		> .list-enter-from {
			opacity: 0;
			transform: translateY(64px);
		}
	}

	&[data-direction="down"] {
		> .list-enter-from {
			opacity: 0;
			transform: translateY(-64px);
		}
	}

	> .separator {
		text-align: center;

		> .date {
			display: inline-block;
			position: relative;
			margin: 0;
			padding-block: 0;
			padding-inline: 16px;
			line-height: 32px;
			text-align: center;
			font-size: 12px;
			color: var(--dateLabelFg);

			> span {
				&:first-child {
					margin-inline-end: 8px;

					> .icon {
						margin-inline-end: 8px;
					}
				}

				&:last-child {
					margin-inline-start: 8px;

					> .icon {
						margin-inline-start: 8px;
					}
				}
			}
		}
	}

	&.noGap {
		> * {
			margin: 0 !important;
			border: none;
			border-radius: 0;
			box-shadow: none;

			&:first-child {
				border-radius: var(--radius) var(--radius) 0 0;
			}
			&:last-child {
				border-radius: 0 0 var(--radius) var(--radius);
			}

			&:not(:last-child) {
				border-block-end: solid 0.5px var(--divider);
			}
		}
	}
}
</style>
