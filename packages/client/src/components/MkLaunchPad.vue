<template>
	<MkModal
		ref="modal"
		v-slot="{ type, maxHeight }"
		:prefer-type="preferedModalType"
		:anchor="anchor"
		:transparent-bg="true"
		:src="src"
		@click="modal!.close()"
		@closed="emit('closed')"
	>
		<div
			class="szkkfdyq _popup _shadow"
			:class="{ asDrawer: type === 'drawer' }"
			:style="{ maxHeight: maxHeight ? maxHeight + 'px' : '' }"
		>
			<div class="main">
				<template v-for="item in items">
					<button
						v-if="item.action"
						v-click-anime
						class="_button"
						@click="
							($event) => {
								item.action($event);
								close();
							}
						"
					>
						<i class="icon" :class="item.icon"></i>
						<div class="text">{{ item.text }}</div>
						<span
							v-if="item.indicate"
							class="indicator"
							:class="{
								animateIndicator: defaultStore.state.animation,
							}"
							><i class="ph-circle ph-fill"></i
						></span>
					</button>
					<MkA
						v-else
						v-click-anime
						:to="item.to"
						@click.passive="close()"
					>
						<i class="icon" :class="item.icon"></i>
						<div class="text">{{ item.text }}</div>
						<span
							v-if="item.indicate"
							class="indicator"
							:class="{
								animateIndicator: defaultStore.state.animation,
							}"
							><i class="ph-circle ph-fill"></i
						></span>
					</MkA>
				</template>
			</div>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import MkModal from "@/components/MkModal.vue";
import { navbarItemDef } from "@/navbar";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { deviceKind } from "@/scripts/device-kind";

const props = withDefaults(
	defineProps<{
		src?: HTMLElement;
		anchor?: {
			x: "left" | "center" | "right";
			y: "top" | "center" | "bottom";
		};
	}>(),
	{
		anchor: () => ({ x: "right", y: "center" }),
	},
);

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

const preferedModalType =
	deviceKind === "desktop" && props.src != null
		? "popup"
		: deviceKind === "smartphone"
			? "drawer"
			: "dialog";

const modal = ref<InstanceType<typeof MkModal>>();

const menu = defaultStore.state.menu;

const items = Object.keys(navbarItemDef)
	.filter((k) => !menu.includes(k))
	.map((k) => navbarItemDef[k])
	.filter((def) => (def.show == null ? true : def.show))
	.map((def) => ({
		type: def.to ? "link" : "button",
		text: i18n.ts[def.title],
		icon: def.icon,
		to: def.to,
		action: def.action,
		indicate: def.indicated,
	}));

function close() {
	modal.value!.close();
}
</script>

<style lang="scss" scoped>
.szkkfdyq {
	max-block-size: 100%;
	inline-size: min(460px, 100vi);
	padding: 24px;
	box-sizing: border-box;
	overflow: auto;
	overscroll-behavior: contain;
	text-align: start;
	border-radius: 16px;

	&.asDrawer {
		inline-size: 100%;
		padding: 16px 16px calc(env(safe-area-inset-bottom, 0px) + 16px) 16px;
		border-radius: 24px;
		border-end-end-radius: 0;
		border-end-start-radius: 0;
		text-align: center;
	}

	> .main,
	> .sub {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));

		> * {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			vertical-align: bottom;
			block-size: 100px;
			border-radius: 10px;

			&:hover,
			&:focus-visible {
				color: var(--accent);
				background: var(--accentedBg);
				text-decoration: none;
			}

			> .icon {
				font-size: 24px;
				block-size: 24px;
			}

			> .text {
				margin-block-start: 12px;
				font-size: 0.8em;
				line-height: 1.5em;
			}

			> .indicator {
				position: absolute;
				inset-block-start: 32px;
				inset-inline-start: 32px;
				color: var(--indicator);
				font-size: 8px;

				@media (max-inline-size: 500px) {
					inset-block-start: 16px;
					inset-inline-start: 16px;
				}
			}

			> .animateIndicator {
				animation: blink 1s infinite;
			}
		}
	}

	> .sub {
		margin-block-start: 8px;
		padding-block-start: 8px;
		border-block-start: solid 0.5px var(--divider);
	}
}
</style>
