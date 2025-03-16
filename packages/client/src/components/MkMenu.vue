<template>
	<FocusTrap
		ref="focusTrap"
		v-model:active="isActive"
		:return-focus-on-deactivate="!noReturnFocus"
		@deactivate="emit('close')"
	>
		<div>
			<div
				ref="itemsEl"
				v-vibrate="5"
				class="rrevdjwt _popup _shadow"
				:class="{ center: align === 'center', asDrawer }"
				:style="{
					inlineSize: width && !asDrawer ? width + 'px' : '',
					maxBlockSize: maxHeight ? maxHeight + 'px' : '',
				}"
				tabindex="-1"
				@contextmenu.self="(e) => e.preventDefault()"
			>
				<template v-for="item in items2">
					<div v-if="item === null" class="divider"></div>
					<span v-else-if="item.type === 'label'" class="label item">
						<span :style="item.textStyle || ''">{{
							item.text
						}}</span>
					</span>
					<span
						v-else-if="item.type === 'pending'"
						class="pending item"
					>
						<span><MkEllipsis /></span>
					</span>
					<MkA
						v-else-if="item.type === 'link'"
						:to="item.to"
						class="_button item"
						@click.passive="close(true)"
						@mouseenter.passive="onItemMouseEnter(item)"
						@mouseleave.passive="onItemMouseLeave(item)"
					>
						<i
							v-if="item.icon"
							class="ph-fw ph-lg"
							:class="item.icon"
						></i>
						<MkAvatar
							v-if="item.avatar"
							:user="item.avatar"
							class="avatar"
							disable-link
						/>
						<span :style="item.textStyle || ''">{{
							item.text
						}}</span>
						<span
							v-if="item.indicate"
							class="indicator"
							:class="{
								animateIndicator: defaultStore.state.animation,
							}"
							><i class="ph-circle ph-fill"></i
						></span>
					</MkA>
					<a
						v-else-if="item.type === 'a'"
						:href="item.href"
						:target="item.target"
						:download="item.download"
						class="_button item"
						@click="close(true)"
						@mouseenter.passive="onItemMouseEnter(item)"
						@mouseleave.passive="onItemMouseLeave(item)"
					>
						<i
							v-if="item.icon"
							:class="icon(`${item.icon} ph-fw`)"
						></i>
						<span :style="item.textStyle || ''">{{
							item.text
						}}</span>
						<span
							v-if="item.indicate"
							class="indicator"
							:class="{
								animateIndicator: defaultStore.state.animation,
							}"
							><i class="ph-circle ph-fill"></i
						></span>
					</a>
					<button
						v-else-if="item.type === 'user'"
						v-show="!item.hidden"
						class="_button item"
						:class="{ active: item.active }"
						:disabled="item.active"
						@click="clicked(item.action, $event)"
						@mouseenter.passive="onItemMouseEnter(item)"
						@mouseleave.passive="onItemMouseLeave(item)"
					>
						<MkAvatar
							:user="item.user"
							class="avatar"
							disable-link
						/><MkUserName :user="item.user" />
						<span
							v-if="item.indicate"
							class="indicator"
							:class="{
								animateIndicator: defaultStore.state.animation,
							}"
							><i class="ph-circle ph-fill"></i
						></span>
					</button>
					<span
						v-else-if="item.type === 'switch'"
						class="item"
						@mouseenter.passive="onItemMouseEnter(item)"
						@mouseleave.passive="onItemMouseLeave(item)"
					>
						<FormSwitch
							v-model="item.ref"
							:disabled="item.disabled"
							class="form-switch"
							:style="item.textStyle || ''"
							>{{ item.text }}</FormSwitch
						>
					</span>
					<button
						v-else-if="item.type === 'parent'"
						class="_button item parent"
						:class="{ childShowing: childShowingItem === item }"
						@mouseenter.passive="showChildren(item, $event)"
						@click.stop="showChildren(item, $event)"
					>
						<i
							v-if="item.icon"
							:class="icon(`${item.icon} ph-fw`)"
						></i>
						<span :style="item.textStyle || ''">{{
							item.text
						}}</span>
						<span class="caret"
							><i :class="icon('ph-caret-right ph-fw ph-dir')"></i
						></span>
					</button>
					<button
						v-else-if="!item.hidden"
						class="_button item"
						:class="{
							danger: item.danger,
							accent: item.accent,
							active: item.active,
						}"
						:disabled="item.active"
						@click="clicked(item.action, $event)"
						@mouseenter.passive="onItemMouseEnter(item)"
						@mouseleave.passive="onItemMouseLeave(item)"
					>
						<i
							v-if="item.icon"
							:class="icon(`${item.icon} ph-fw`)"
						></i>
						<MkAvatar
							v-if="item.avatar"
							:user="item.avatar"
							class="avatar"
							disable-link
						/>
						<span :style="item.textStyle || ''">{{
							item.text
						}}</span>
						<span
							v-if="item.indicate"
							class="indicator"
							:class="{
								animateIndicator: defaultStore.state.animation,
							}"
							><i class="ph-circle ph-fill"></i
						></span>
					</button>
				</template>
				<span v-if="items2.length === 0" class="none item">
					<span>{{ i18n.ts.none }}</span>
				</span>
			</div>
			<div v-if="childMenu" class="child">
				<XChild
					v-if="childTarget && itemsEl"
					ref="child"
					:items="childMenu"
					:target-element="childTarget"
					:root-element="itemsEl"
					showing
					@actioned="childActioned"
					@closed="closeChild"
				/>
			</div>
		</div>
	</FocusTrap>
</template>

<script lang="ts" setup>
import {
	type Ref,
	defineAsyncComponent,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
} from "vue";
import { FocusTrap } from "focus-trap-vue";
import FormSwitch from "@/components/form/switch.vue";
import type {
	InnerMenuItem,
	MenuAction,
	MenuItem,
	MenuParent,
	MenuPending,
} from "@/types/menu";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const XChild = defineAsyncComponent(() => import("./MkMenu.child.vue"));
const focusTrap = ref();

const props = defineProps<{
	items: MenuItem[];
	viaKeyboard?: boolean;
	asDrawer?: boolean;
	align?: "center" | string;
	width?: number;
	maxHeight?: number;
	noReturnFocus?: boolean;
}>();

const emit = defineEmits<{
	close: [actioned?: boolean];
}>();

const itemsEl = ref<HTMLDivElement>();

/**
 * Strictly speaking, this type conversion is wrong
 * because `ref` will deeply unpack the `ref` in `MenuSwitch`.
 * But it performs correctly, so who cares?
 */
const items2 = ref([]) as Ref<InnerMenuItem[]>;

const child = ref<InstanceType<typeof XChild>>();

const childShowingItem = ref<MenuItem | null>();

// FIXME: this is not used
const isActive = ref();

watch(
	() => props.items,
	() => {
		const items: (MenuItem | MenuPending)[] = props.items.filter(
			(item) => item !== undefined,
		);

		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			if (item && "then" in item) {
				// if item is Promise
				items[i] = { type: "pending" };
				item.then((actualItem) => {
					items2.value[i] = actualItem;
				});
			}
		}

		items2.value = items as InnerMenuItem[];
	},
	{
		immediate: true,
	},
);

const childMenu = ref<MenuItem[] | null>();
const childTarget = ref<HTMLElement | null>();

function closeChild() {
	childMenu.value = null;
	childShowingItem.value = null;
}

function childActioned() {
	closeChild();
	close(true);
}

function onGlobalMousedown(event: MouseEvent) {
	if (
		childTarget.value &&
		(event.target === childTarget.value ||
			childTarget.value.contains(event.target as Node))
	)
		return;
	if (child.value?.checkHit(event)) return;
	closeChild();
}

let childCloseTimer: null | number = null;
function onItemMouseEnter(_item) {
	childCloseTimer = window.setTimeout(() => {
		closeChild();
	}, 300);
}
function onItemMouseLeave(_item) {
	if (childCloseTimer) window.clearTimeout(childCloseTimer);
}

async function showChildren(item: MenuParent, ev: MouseEvent) {
	if (props.asDrawer) {
		if (ev.type === "mouseenter") return;
		os.popupMenu(item.children, (ev.currentTarget ?? ev.target) as HTMLElement);
		close();
	} else {
		childTarget.value = (ev.currentTarget ?? ev.target) as HTMLElement;
		childMenu.value = item.children;
		childShowingItem.value = item;
	}
}

function clicked(fn: MenuAction, ev: MouseEvent) {
	fn(ev);
	close(true);
}

function close(actioned = false) {
	emit("close", actioned);
}

onMounted(() => {
	document.addEventListener("mousedown", onGlobalMousedown, {
		passive: true,
	});
});

onBeforeUnmount(() => {
	document.removeEventListener("mousedown", onGlobalMousedown);
});
</script>

<style lang="scss" scoped>
.rrevdjwt {
	padding-block: 8px;
	padding-inline: 0;
	box-sizing: border-box;
	min-inline-size: 200px;
	overflow: auto;
	overscroll-behavior: contain;

	&.center {
		> .item {
			text-align: center;
		}
	}

	> .item {
		display: flex;
		align-items: center;
		position: relative;
		padding-block: 6px;
		padding-inline: 16px;
		min-inline-size: 100%;
		box-sizing: border-box;
		white-space: nowrap;
		font-size: 0.9em;
		line-height: 20px;
		text-align: start;
		outline: none;

		&:before {
			content: "";
			display: block;
			position: absolute;
			inset: 0;
			margin: auto;
			inline-size: calc(100% - 16px);
			margin-block-end: 0.2rem;
			border-radius: 6px;
		}

		> * {
			position: relative;
		}

		&:not(:disabled):hover,
		&:focus-visible {
			color: var(--accent);
			text-decoration: none;

			&:before {
				background: var(--accentedBg);
			}
		}
		&:focus-visible:before {
			outline: auto;
		}

		&.danger {
			color: #eb6f92;

			&:hover {
				color: #e0def4;

				&:before {
					background: #eb6f92;
				}
			}

			&:active {
				color: #e0def4;

				&:before {
					background: #b4637a;
				}
			}
		}

		&.accent {
			color: var(--accent);

			&:hover {
				color: var(--accent);

				&:before {
					background: var(--accentedBg);
				}
			}

			&:active {
				color: var(--fgOnAccent);

				&:before {
					background: var(--accent);
				}
			}
		}

		&.active {
			color: var(--fgOnAccent);
			opacity: 1;

			&:before {
				background: var(--accent);
			}
		}

		&:not(:active):focus-visible {
			box-shadow: 0 0 0 2px var(--focus) inset;
		}

		&.label {
			pointer-events: none;
			font-size: 0.7em;
			padding-block-end: 4px;

			> span {
				opacity: 0.7;
			}
		}

		&.pending {
			pointer-events: none;
			opacity: 0.7;
		}

		&.none {
			pointer-events: none;
			opacity: 0.7;
		}

		&.parent {
			display: flex;
			align-items: center;
			cursor: default;

			> .caret {
				margin-inline-start: auto;
			}

			&.childShowing {
				color: var(--accent);
				text-decoration: none;

				&:before {
					background: var(--accentedBg);
				}
			}
		}

		> i {
			margin-inline-end: 5px;
			inline-size: 20px;
		}

		> .avatar {
			margin-inline-end: 5px;
			inline-size: 20px;
			block-size: 20px;
		}

		> .indicator {
			position: absolute;
			inset-block-start: 5px;
			inset-inline-start: 13px;
			color: var(--indicator);
			font-size: 12px;
		}

		> .animateIndicator {
			animation: blink 1s infinite;
		}
	}

	> .divider {
		margin-block: 8px;
		margin-inline: 0;
		border-block-start: solid 0.5px var(--divider);
	}

	&.asDrawer {
		padding: 12px 0 calc(env(safe-area-inset-bottom, 0px) + 12px) 0;
		inline-size: 100%;
		border-radius: 24px;
		border-end-end-radius: 0;
		border-end-start-radius: 0;

		> .item {
			font-size: 1em;
			padding-block: 12px;
			padding-inline: 24px;

			&:before {
				inline-size: calc(100% - 24px);
				border-radius: 12px;
			}

			> i {
				margin-inline-end: 14px;
				inline-size: 24px;
			}
		}

		> .divider {
			margin-block: 12px;
			margin-inline: 0;
		}
	}
}
</style>
