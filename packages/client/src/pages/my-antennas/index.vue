<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="700">
			<div class="ieepwinx">
				<MkInfo class="_gap" :icon="'flying-saucer'" :card="true">
					<p>{{ i18n.ts.antennasDesc }}</p>
					<MkButton
						:link="true"
						to="/my/antennas/create"
						primary
						class="add"
						><i :class="icon('ph-plus')"></i>
						{{ i18n.ts.add }}</MkButton
					>
				</MkInfo>
				<div class="">
					<MkPagination ref="list" :pagination="pagination">
						<template #default="{ items }">
							<div v-for="antenna in items" :key="antenna.id">
								<MkA
									class="uopelskx"
									:link="true"
									:to="`/timeline/antenna/${antenna.id}`"
								>
									<i :class="icon('ph-flying-saucer')"></i
									><i
										:class="`${
											antenna.hasUnreadNote
												? 'ph-circle ph-fill'
												: 'ph-check'
										} ph-xs notify-icon`"
									></i>
								</MkA>
								<MkA
									class="ljoevbzj"
									:to="`/my/antennas/${antenna.id}`"
								>
									<div class="name">{{ antenna.name }}</div>
								</MkA>
							</div>
						</template>
					</MkPagination>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onActivated, onDeactivated, ref } from "vue";
import type { MkPaginationType } from "@/components/MkPagination.vue";
import MkPagination from "@/components/MkPagination.vue";
import MkButton from "@/components/MkButton.vue";
import MkInfo from "@/components/MkInfo.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const pagination = {
	endpoint: "antennas/list" as const,
	limit: 250,
};

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

const list = ref<MkPaginationType<typeof pagination.endpoint> | null>(null);

let isCached = false;
let refreshTimer: number | null = null;

const refresh = () => {
	if (isCached) {
		list.value?.refresh();
	}

	isCached = true;
	refreshTimer = setTimeout(refresh, 15000);
};

onActivated(() => {
	refresh();
});

onDeactivated(() => {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
		refreshTimer = null;
	}
});

definePageMetadata({
	title: i18n.ts.manageAntennas,
	icon: `${icon("ph-flying-saucer")}`,
});
</script>

<style lang="scss" scoped>
.ieepwinx {
	.uopelskx {
		float: inline-start;
		min-inline-size: 25px;
		padding: 13px;
		margin-inline-end: 10px;
		border: solid 1px var(--divider);
		border-radius: 6px;

		&:hover {
			border: solid 1px var(--accent);
			text-decoration: none;
		}
	}

	.ljoevbzj {
		display: block;
		padding: 16px;
		margin-block-end: 8px;
		border: solid 1px var(--divider);
		border-radius: 6px;

		&:hover {
			border: solid 1px var(--accent);
			text-decoration: none;
		}

		> .name {
			font-weight: bold;
		}
	}

	.notify-icon {
		position: relative;
		inset-block-start: -1em;
		inset-inline-start: -0.5em;

		&.ph-circle ph-fill {
			color: var(--indicator);
			animation: blink 1s infinite;
		}

		&.ph-check {
			color: var(--muted);
		}
	}
}
</style>
