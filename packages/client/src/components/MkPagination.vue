<template>
	<transition
		:name="defaultStore.state.animation ? 'fade' : ''"
		mode="out-in"
	>
		<MkLoading v-if="fetching" />

		<MkError v-else-if="error" @retry="reload()" />

		<div v-else-if="empty" key="_empty_" class="empty">
			<slot name="empty">
				<div class="_fullinfo">
					<img
						src="/static-assets/badges/info.webp"
						class="_ghost"
						alt="Error"
					/>
					<div>{{ i18n.ts.nothing }}</div>
				</div>
			</slot>
		</div>

		<div v-else ref="rootEl" class="list">
			<div
				v-show="pagination.reversed && more"
				key="_more_"
				class="cxiknjgy _gap"
			>
				<MkButton
					v-if="!moreFetching"
					class="button"
					:disabled="moreFetching"
					:style="{ cursor: moreFetching ? 'wait' : 'pointer' }"
					primary
					@click="fetchMoreAhead"
				>
					{{ i18n.ts.loadMore }}
				</MkButton>
				<MkLoading v-else class="loading" />
			</div>
			<slot :items="items" :folded-items="foldedItems"></slot>
			<div
				v-show="!pagination.reversed && more"
				key="_more_"
				class="cxiknjgy _gap"
			>
				<MkButton
					v-if="!moreFetching"
					v-appear="
						defaultStore.state.enableInfiniteScroll &&
						!disableAutoLoad
							? fetchMore
							: null
					"
					class="button"
					:disabled="moreFetching"
					:style="{ cursor: moreFetching ? 'wait' : 'pointer' }"
					primary
					@click="fetchMore"
				>
					{{ i18n.ts.loadMore }}
				</MkButton>
				<MkLoading v-else class="loading" />
			</div>
		</div>
	</transition>
</template>

<script lang="ts" setup generic="E extends PagingKey, Fold extends PagingAble">
import type { ComponentPublicInstance, ComputedRef, Ref } from "vue";
import {
	computed,
	isRef,
	onActivated,
	onDeactivated,
	ref,
	unref,
	watch,
} from "vue";
import type { Endpoints, TypeUtils } from "firefish-js";
import * as os from "@/os";
import { isTopVisible, onScrollTop } from "@/scripts/scroll";
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";

/**
 * ref type of MkPagination<E>
 * Due to Vue's incomplete type support for generic components,
 * we have to manually maintain this type instead of
 * using `InstanceType<typeof MkPagination>`
 */
export type MkPaginationType<
	E extends PagingKey,
	Item = Endpoints[E]["res"][number],
> = ComponentPublicInstance & {
	items: Item[];
	queue: Item[];
	backed: boolean;
	reload: () => Promise<void>;
	refresh: () => Promise<void>;
	prepend: (item: Item) => Promise<void>;
	append: (...item: Item[]) => Promise<void>;
	removeItem: (finder: (item: Item) => boolean) => boolean;
	updateItem: (id: string, replacer: (old: Item) => Item) => boolean;
};

export interface PagingAble {
	id: string;
}

export type PagingKeyOf<T> = TypeUtils.EndpointsOf<T[]>;
// biome-ignore lint/suspicious/noExplicitAny: Used Intentionally
export type PagingKey = PagingKeyOf<any>;

export interface Paging<E extends PagingKey = PagingKey> {
	endpoint: E;
	limit: number;
	secondFetchLimit?: number;
	params?: Endpoints[E]["req"] | ComputedRef<Endpoints[E]["req"]>;

	/**
	 * 検索APIのような、ページング不可なエンドポイントを利用する場合
	 * (そのようなAPIをこの関数で使うのは若干矛盾してるけど)
	 */
	noPaging?: boolean;

	/**
	 * items 配列の中身を逆順にする(新しい方が最後)
	 */
	reversed?: boolean;

	/**
	 * For not-reversed, not-offsetMode,
	 * Sort by id in ascending order
	 */
	ascending?: boolean;

	offsetMode?: boolean;
}

export type PagingOf<T> = Paging<TypeUtils.EndpointsOf<T[]>>;

type Item = Endpoints[E]["res"][number];
type Param = Endpoints[E]["req"] | Record<string, never>;

const SECOND_FETCH_LIMIT_DEFAULT = 30;
const FIRST_FETCH_LIMIT_DEFAULT = 10;

const props = withDefaults(
	defineProps<{
		pagination: Paging<E>;
		disableAutoLoad?: boolean;
		displayLimit?: number;
		folder?: (i: Item[]) => Fold[];
	}>(),
	{
		displayLimit: 30,
	},
);

const slots = defineSlots<{
	default(props: { items: Item[]; foldedItems: Fold[] }): unknown;
	empty(props: Record<string, never>): never;
}>();

const emit = defineEmits<{
	(ev: "queue", count: number): void;
	(ev: "status", hasError: boolean): void;
}>();

const rootEl = ref<HTMLElement>();
const items = ref<Item[]>([]);
const foldedItems = ref([]) as Ref<Fold[]>;

function toReversed<T>(arr: T[]) {
	return [...arr].reverse();
}

// To improve performance, we do not use vue’s `computed` here
function calculateItems() {
	function getItems<T>(folder: (ns: Item[]) => T[]) {
		const res = [
			folder(toReversed(prepended.value)),
			...arrItems.value.map((arr) => folder(arr)),
			folder(appended.value),
		].flat(1);
		if (props.pagination.reversed) {
			res.reverse();
		}
		return res;
	}
	items.value = getItems((x) => x);
	if (props.folder) foldedItems.value = getItems(props.folder);
}

const queue = ref<Item[]>([]);

/**
 * The cached elements inserted front by `prepend` function
 */
const prepended = ref<Item[]>([]);
/**
 * The array of "frozen" items
 */
const arrItems = ref<Item[][]>([]);
/**
 * The cached elements inserted back by `append` function
 */
const appended = ref<Item[]>([]);

const idMap = new Map<string, boolean>();

const offset = ref(0);

type PagingByParam =
	| {
			offset: number;
	  }
	| {
			sinceId: string;
	  }
	| {
			untilId: string;
	  }
	| Record<string, never>;
let nextPagingBy: PagingByParam = {};

const fetching = ref(true);
const moreFetching = ref(false);
const more = ref(false);
const backed = ref(false); // 遡り中か否か
const isBackTop = ref(false);
const empty = computed(() => items.value.length === 0);
const error = ref(false);

const init = async (): Promise<void> => {
	queue.value = [];
	fetching.value = true;

	await fetch(true);
};

const reload = (): Promise<void> => {
	arrItems.value = [];
	appended.value = [];
	prepended.value = [];
	idMap.clear();
	offset.value = 0;
	nextPagingBy = {};
	return init();
};

const refresh = async (): Promise<void> => {
	const params = props.pagination.params ? unref(props.pagination.params) : {};
	await os
		.api(props.pagination.endpoint, {
			...params,
			limit: (items.value.length || foldedItems.value.length) + 1,
			offset: 0,
		})
		.then(
			(res: Item[]) => {
				appended.value = [];
				prepended.value = [];

				// appended should be inserted into arrItems to fix the element position
				arrItems.value = [res];

				calculateItems();
			},
			(_err) => {
				error.value = true;
				fetching.value = false;
			},
		);
};

async function fetch(firstFetching?: boolean) {
	let limit: number;

	if (firstFetching) {
		limit = props.pagination.noPaging
			? props.pagination.limit || FIRST_FETCH_LIMIT_DEFAULT
			: (props.pagination.limit || FIRST_FETCH_LIMIT_DEFAULT) + 1;

		if (props.pagination.ascending) {
			nextPagingBy = {
				// An initial value smaller than all possible ids must be filled in here.
				sinceId: "0",
			};
		}
	} else {
		if (
			!more.value ||
			fetching.value ||
			moreFetching.value ||
			items.value.length === 0
		)
			return;
		moreFetching.value = true;
		backed.value = true;

		limit =
			(props.pagination.secondFetchLimit ?? SECOND_FETCH_LIMIT_DEFAULT) + 1;
	}

	const params = props.pagination.params ? unref(props.pagination.params) : {};

	await os
		.api(props.pagination.endpoint, {
			...params,
			limit,
			...nextPagingBy,
		})
		.then(
			(res: Item[]) => {
				if (!props.pagination.reversed)
					for (let i = 0; i < res.length; i++) {
						const item = res[i];
						if (props.pagination.reversed) {
							if (i === res.length - (firstFetching ? 2 : 9))
								item._shouldInsertAd_ = true;
						} else {
							if (i === (firstFetching ? 3 : 10)) item._shouldInsertAd_ = true;
						}
					}
				if (!props.pagination.noPaging && res.length > limit - 1) {
					res.pop();
					more.value = true;
				} else {
					more.value = false;
				}

				offset.value += res.length;
				error.value = false;
				fetching.value = false;
				moreFetching.value = false;

				const lastRes = res[res.length - 1];

				if (props.pagination.offsetMode) {
					nextPagingBy = {
						offset: offset.value,
					};
				} else if (props.pagination.ascending) {
					nextPagingBy = {
						sinceId: lastRes?.id,
					};
				} else {
					nextPagingBy = {
						untilId: lastRes?.id,
					};
				}

				if (firstFetching && props.folder != null) {
					// In this way, prepended has some initial values for folding
					prepended.value = toReversed(res);
				} else {
					// For ascending and offset modes, append and prepend may cause item duplication
					// so they need to be filtered out.
					if (props.pagination.offsetMode || props.pagination.ascending) {
						for (const item of appended.value) {
							idMap.set(item.id, true);
						}

						// biome-ignore lint/style/noParameterAssign: assign it intentially
						res = res.filter((it) => {
							if (idMap.has(it.id)) return false;
							idMap.set(it.id, true);
							return true;
						});
					}

					// appended should be inserted into arrItems to fix the element position
					arrItems.value.push(appended.value);
					arrItems.value.push(res);
					appended.value = [];
				}

				calculateItems();
			},
			(_err) => {
				error.value = true;
				fetching.value = false;
				moreFetching.value = false;
			},
		);
}

const fetchMore = async (): Promise<void> => {
	await fetch();
};

const fetchMoreAhead = async (): Promise<void> => {
	await fetch();
};

const prepend = (...item: Item[]): void => {
	// If there are too many prepended, merge them into arrItems
	if (
		prepended.value.length >
		(props.pagination.secondFetchLimit || SECOND_FETCH_LIMIT_DEFAULT)
	) {
		arrItems.value.unshift(toReversed(prepended.value));
		prepended.value = [];
		// We don't need to calculate here because it won't cause any changes in items
	}

	if (props.pagination.reversed) {
		prepended.value.push(...item);
		calculateItems();
	} else {
		// When displaying for the first time, just do this is OK
		if (!rootEl.value) {
			prepended.value.push(...item);
			calculateItems();
			return;
		}

		const isTop =
			isBackTop.value ||
			(document.body.contains(rootEl.value) && isTopVisible(rootEl.value));

		if (isTop) {
			prepended.value.push(...item);
			calculateItems();
		} else {
			queue.value.push(...item);
			onScrollTop(rootEl.value, () => {
				prepend(...queue.value);
				queue.value = [];
			});
		}
	}
};

const append = (...it: Item[]): void => {
	// If there are too many appended, merge them into arrItems
	if (
		appended.value.length >
		(props.pagination.secondFetchLimit || SECOND_FETCH_LIMIT_DEFAULT)
	) {
		for (const item of appended.value) {
			idMap.set(item.id, true);
		}
		arrItems.value.push(appended.value);
		appended.value = [];
		// We don't need to calculate here because it won't cause any changes in items
	}
	appended.value.push(...it);
	calculateItems();
};

const _removeItem = (arr: Item[], finder: (item: Item) => boolean): boolean => {
	const i = arr.findIndex(finder);
	if (i === -1) {
		return false;
	}

	arr.splice(i, 1);
	return true;
};

const _updateItem = (
	arr: Item[],
	id: Item["id"],
	replacer: (old: Item) => Item,
): boolean => {
	const i = arr.findIndex((item) => item.id === id);
	if (i === -1) {
		return false;
	}

	arr[i] = replacer(arr[i]);
	return true;
};

const removeItem = (finder: (item: Item) => boolean): boolean => {
	const res =
		_removeItem(prepended.value, finder) ||
		_removeItem(appended.value, finder) ||
		arrItems.value.filter((arr) => _removeItem(arr, finder)).length > 0;
	calculateItems();
	return res;
};

const updateItem = (id: Item["id"], replacer: (old: Item) => Item): boolean => {
	const res =
		_updateItem(prepended.value, id, replacer) ||
		_updateItem(appended.value, id, replacer) ||
		arrItems.value.filter((arr) => _updateItem(arr, id, replacer)).length > 0;
	calculateItems();
	return res;
};

if (props.pagination.params && isRef<Param>(props.pagination.params)) {
	watch(props.pagination.params, reload, { deep: true });
}

watch(() => props.folder, calculateItems);

watch(
	queue,
	(a, b) => {
		if (a.length === 0 && b.length === 0) return;
		emit("queue", queue.value.length);
	},
	{ deep: true },
);

watch(error, (n, o) => {
	if (n === o) return;
	emit("status", n);
});

init();

onActivated(() => {
	isBackTop.value = false;
});

onDeactivated(() => {
	isBackTop.value = window.scrollY === 0;
});

defineExpose({
	items,
	queue,
	backed,
	reload,
	refresh,
	prepend,
	append,
	removeItem,
	updateItem,
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.125s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.cxiknjgy {
	> .button {
		margin-inline-start: auto;
		margin-inline-end: auto;
	}
}
.list > :deep(._button) {
	margin-inline: auto;
	margin-block-end: 16px;
	&:last-of-type:not(:first-child) {
		margin-block-start: 16px;
	}
}
</style>
