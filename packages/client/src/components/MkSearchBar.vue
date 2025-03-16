<template>
	<div class="mk-search" @click.stop>
		<input v-model="query" type="search" :placeholder="q" />
		<button @click="search">
			<i :class="icon('ph-magnifying-glass')"></i>
			{{ i18n.ts.search }}
		</button>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { i18n } from "@/i18n";
import { useRouter } from "@/router";
import icon from "@/scripts/icon";
import { defaultStore } from "@/store";

const router = useRouter();

const props = defineProps<{
	q: string;
}>();

const query = ref(props.q);

const search = () => {
	if (defaultStore.state.searchURL === "")
		router.push(`/search?q=${query.value}`);
	else window.open(`${defaultStore.state.searchURL}${query.value}`, "_blank");
};
</script>

<style lang="scss" scoped>
.mk-search {
	display: flex;
	margin-block: 8px;
	margin-inline: 0;

	> input {
		flex-shrink: 1;
		padding: 10px;
		inline-size: 100%;
		block-size: 40px;
		font-size: 16px;
		border: solid 1px var(--divider);
		border-radius: 4px 0 0 4px;
		-webkit-appearance: none;
		-webkit-border-radius: 4px 0 0 4px;
	}

	> button {
		flex-shrink: 0;
		margin: 0;
		padding-block: 0;
		padding-inline: 16px;
		border: solid 1px var(--divider);
		border-inline-start: none;
		border-radius: 0 4px 4px 0;

		&:active {
			box-shadow: 0 2px 4px rgba(#000, 0.15) inset;
		}
	}
}
</style>
