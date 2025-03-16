<template>
	<div>
		<MkPagination
			v-slot="{ items }: { items: entities.DriveFile[]}"
			:pagination="pagination"
			class="urempief"
			:class="{ grid: viewMode === 'grid' }"
		>
			<MkA
				v-for="file in items"
				:key="file.id"
				v-tooltip.mfm="
					`${file.type}\n${bytes(file.size)}\n${new Date(
						file.createdAt,
					).toLocaleString()}\nby ${
						file.user ? '@' + acct.toString(file.user) : 'system'
					}`
				"
				:to="`/admin/file/${file.id}`"
				class="file _button"
			>
				<div v-if="file.isSensitive" class="sensitive-label">
					{{ i18n.ts.sensitive }}
				</div>
				<MkDriveFileThumbnail
					class="thumbnail"
					:file="file"
					fit="contain"
				/>
				<div v-if="viewMode === 'list'" class="body">
					<div>
						<small style="opacity: 0.7">{{ file.name }}</small>
					</div>
					<div>
						<MkAcct v-if="file.user" :user="file.user" />
						<div v-else>{{ i18n.ts.system }}</div>
					</div>
					<div>
						<span style="margin-inline-end: 1em">{{ file.type }}</span>
						<span>{{ bytes(file.size) }}</span>
					</div>
					<div>
						<span
							>{{ i18n.ts.registeredDate }}:
							<MkTime :time="file.createdAt" mode="detail"
						/></span>
					</div>
				</div>
			</MkA>
		</MkPagination>
	</div>
</template>

<script lang="ts" setup>
import { acct } from "firefish-js";
import type { entities } from "firefish-js";
import MkPagination from "@/components/MkPagination.vue";
import type { PagingOf } from "@/components/MkPagination.vue";
import MkDriveFileThumbnail from "@/components/MkDriveFileThumbnail.vue";
import bytes from "@/filters/bytes";
import { i18n } from "@/i18n";

defineProps<{
	pagination: PagingOf<entities.DriveFile>;
	viewMode: "grid" | "list";
}>();
</script>

<style lang="scss" scoped>
@keyframes sensitive-blink {
	0% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
}

.urempief {
	margin-block-start: var(--margin);

	&.list {
		> .file {
			display: flex;
			inline-size: 100%;
			box-sizing: border-box;
			text-align: start;
			align-items: center;

			&:hover {
				color: var(--accent);
			}

			> .thumbnail {
				inline-size: 128px;
				block-size: 128px;
			}

			> .body {
				margin-inline-start: 0.3em;
				padding: 8px;
				flex: 1;

				@media (max-inline-size: 500px) {
					font-size: 14px;
				}
			}
		}
	}

	&.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		grid-gap: 12px;
		margin-block: var(--margin);
		margin-inline: 0;

		> .file {
			position: relative;
			aspect-ratio: 1;

			> .thumbnail {
				inline-size: 100%;
				block-size: 100%;
			}

			> .sensitive-label {
				position: absolute;
				z-index: 10;
				inset-block-start: 8px;
				inset-inline-start: 8px;
				padding-block: 2px;
				padding-inline: 4px;
				background: #ff0000bf;
				color: #fff;
				border-radius: 4px;
				font-size: 85%;
				animation: sensitive-blink 1s infinite;
			}
		}
	}
}
</style>
