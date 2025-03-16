<template>
	<MkModal
		ref="modal"
		:prefer-type="'dialog'"
		@click="done(true)"
		@closed="emit('closed')"
	>
		<div :class="$style.root">
			<header :class="$style.title">
				<i :class="icon('ph-magnifying-glass', false)"></i>
				{{ i18n.ts.search }}
			</header>
			<MkInput
				v-model="searchWords"
				autofocus
				type="search"
				:placeholder="i18n.ts.searchWords"
				:class="$style.input"
				@keydown="onInputKeydown"
			>
				<template #suffix>
					<button
						v-tooltip.noDelay="i18n.ts.help"
						class="_buttonIcon"
						@click.stop="openDescription('words')"
					>
						<i :class="icon('ph-question', false)"></i>
					</button>
				</template>
			</MkInput>
			<MkInput
				v-model="searchUsers"
				type="search"
				:placeholder="i18n.ts.searchUsers"
				:class="$style.input"
				@keydown="onInputKeydown"
			>
				<template #suffix>
					<button
						v-tooltip.noDelay="i18n.ts.help"
						class="_buttonIcon"
						@click.stop="openDescription('users')"
					>
						<i :class="icon('ph-question', false)"></i>
					</button>
				</template>
			</MkInput>
			<MkInput
				v-model="searchRange"
				type="search"
				:placeholder="i18n.ts.searchRange"
				:class="$style.input"
				@keydown="onInputKeydown"
			>
				<template #suffix>
					<button
						v-tooltip.noDelay="i18n.ts.help"
						class="_buttonIcon"
						@click.stop="openDescription('range')"
					>
						<i :class="icon('ph-question', false)"></i>
					</button>
				</template>
			</MkInput>
			<FormSwitch
				v-model="searchCwAndAlt"
				class="form-switch"
				:class="$style.input"
				>{{ i18n.ts.searchCwAndAlt }}</FormSwitch
			>
			<FormSwitch
				v-model="searchPostsWithFiles"
				class="form-switch"
				:class="$style.input"
				>{{ i18n.ts.searchPostsWithFiles }}</FormSwitch
			>
			<div :class="$style.buttons">
				<MkButton inline primary @click="search"
					>{{ i18n.ts.search }}
				</MkButton>
				<MkButton inline primary @click="lookup">{{ i18n.ts.lookup }}</MkButton>
				<MkButton inline @click="cancel">{{ i18n.ts.cancel }}</MkButton>
			</div>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import {
	defineAsyncComponent,
	onBeforeUnmount,
	onMounted,
	ref,
	shallowRef,
} from "vue";
import MkModal from "@/components/MkModal.vue";
import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/form/input.vue";
import FormSwitch from "@/components/form/switch.vue";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";
import { popup } from "@/os";

type searchQuery =
	| {
			action: "lookup";
			query: string;
	  }
	| {
			action: "search";
			query?: string;
			from?: string;
			range?: string;
			withFiles: boolean;
			searchCwAndAlt: boolean;
	  };

const emit = defineEmits<{
	(ev: "done", v: { canceled: boolean; result?: searchQuery }): void;
	(ev: "closed"): void;
}>();

const modal = shallowRef<InstanceType<typeof MkModal>>();

const searchParams = new URLSearchParams(window.location.search);

const searchWords = ref(searchParams.get("q") ?? "");
const searchUsers = ref(
	searchParams.get("user") ?? searchParams.get("host") ?? "",
);
const searchRange = ref(
	searchParams.has("since") || searchParams.has("until")
		? `${searchParams.get("since") ?? ""}-${searchParams.get("until") ?? ""}`
		: "",
);
const searchPostsWithFiles = ref(searchParams.get("withFiles") === "1");
const searchCwAndAlt = ref(searchParams.get("detailed") !== "0");

function done(canceled: boolean, result?: searchQuery) {
	emit("done", { canceled, result });
	modal.value?.close(null);
}

function search() {
	searchWords.value = searchWords.value.trim();
	searchUsers.value = searchUsers.value.trim();
	searchRange.value = searchRange.value.trim();

	if (
		searchWords.value === "" &&
		searchUsers.value === "" &&
		searchRange.value === ""
	)
		return;

	done(false, {
		action: "search",
		query: searchWords.value === "" ? undefined : searchWords.value,
		from: searchUsers.value === "" ? undefined : searchUsers.value,
		range: searchRange.value === "" ? undefined : searchRange.value,
		withFiles: searchPostsWithFiles.value,
		searchCwAndAlt: searchCwAndAlt.value,
	});
}

function lookup() {
	searchWords.value = searchWords.value.trim();

	if (searchWords.value === "") return;

	done(false, {
		action: "lookup",
		query: searchWords.value,
	});
}

function cancel() {
	done(true);
}

function onKeydown(evt: KeyboardEvent) {
	if (evt.key === "Escape") cancel();
}

function onInputKeydown(evt: KeyboardEvent) {
	if (evt.key === "Enter") {
		evt.preventDefault();
		evt.stopPropagation();
		search();
	}
}

function openDescription(kind: "words" | "users" | "range"): void {
	const descriptions = {
		words: i18n.ts.searchWordsDescription,
		users: i18n.ts.searchUsersDescription,
		range: i18n.ts.searchRangeDescription,
	};

	popup(
		defineAsyncComponent(() => import("@/components/MkSimpleTextWindow.vue")),
		{
			title: i18n.ts.help,
			description: descriptions[kind],
		},
		{},
		"closed",
	);
}

onMounted(() => {
	document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown);
});
</script>

<style lang="scss" module>
.root {
	position: relative;
	margin: auto;
	padding: 32px;
	min-inline-size: 320px;
	max-inline-size: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);
}

.input {
	margin-block: 12px;
	margin-inline: 0;
}

.title {
	margin-block-start: 0;
	margin-inline: 0;
	margin-block-end: 25px;
	font-weight: bold;
	font-size: 1.3em;
}

.buttons {
	margin-block-start: 16px;
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
}
</style>
