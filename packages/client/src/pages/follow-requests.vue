<template>
	<MkStickyContainer>
		<template #header><MkPageHeader /></template>
		<MkSpacer :content-max="800">
			<MkPagination ref="paginationComponent" :pagination="pagination">
				<template #empty>
					<div class="_fullinfo">
						<img
							src="/static-assets/badges/info.webp"
							aria-label="none"
							class="_ghost"
						/>
						<div>{{ i18n.ts.noFollowRequests }}</div>
					</div>
				</template>
				<template #default="{ items }">
					<MkInfo v-if="me?.isLocked === false" warn class="info"
						>{{ i18n.ts.silencedWarning }}
					</MkInfo>
					<div class="mk-follow-requests">
						<div
							v-for="req in items"
							:key="req.id"
							class="user _panel"
						>
							<MkAvatar
								class="avatar"
								:user="req.follower"
								:show-indicator="true"
								disable-link
							/>
							<div class="body">
								<div class="name">
									<MkA
										v-user-preview="req.follower.id"
										class="name"
										:to="userPage(req.follower)"
										><MkUserName :user="req.follower"
									/></MkA>
									<p class="acct">
										@{{ acct.toString(req.follower) }}
									</p>
								</div>
								<div
									v-if="req.follower.description"
									class="description"
									:title="req.follower.description"
								>
									<Mfm
										:text="req.follower.description"
										:is-note="false"
										:author="req.follower"
										:i="me"
										:custom-emojis="req.follower.emojis"
										:plain="true"
										:nowrap="true"
									/>
								</div>
								<div class="actions">
									<button
										class="_button"
										:aria-label="i18n.ts.accept"
										@click="accept(req.follower)"
									>
										<i :class="icon('ph-check')"></i>
									</button>
									<button
										class="_button"
										:aria-label="i18n.ts.reject"
										@click="reject(req.follower)"
									>
										<i :class="icon('ph-x')"></i>
									</button>
								</div>
							</div>
						</div>
					</div>
				</template>
			</MkPagination>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { acct } from "firefish-js";
import MkPagination from "@/components/MkPagination.vue";
import type { MkPaginationType } from "@/components/MkPagination.vue";
import { userPage } from "@/filters/user";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { me } from "@/me";
import icon from "@/scripts/icon";

const paginationComponent = ref<MkPaginationType<
	typeof pagination.endpoint
> | null>(null);

const pagination = {
	endpoint: "following/requests/list" as const,
	limit: 10,
	noPaging: true,
};

function accept(user) {
	os.api("following/requests/accept", { userId: user.id }).then(() => {
		paginationComponent.value!.reload();
	});
}

function reject(user) {
	os.api("following/requests/reject", { userId: user.id }).then(() => {
		paginationComponent.value!.reload();
	});
}

definePageMetadata(
	computed(() => ({
		title: i18n.ts.followRequests,
		icon: `${icon("ph-hand-waving")}`,
	})),
);
</script>

<style lang="scss" scoped>
.mk-follow-requests {
	> .user {
		display: flex;
		padding: 16px;
		margin-block-start: 10px;
		margin-inline: 0;
		margin-block-end: auto;

		> .avatar {
			display: block;
			flex-shrink: 0;
			margin-block-start: 0;
			margin-inline-end: 12px;
			margin-block-end: 0;
			margin-inline-start: 0;
			inline-size: 42px;
			block-size: 42px;
			border-radius: 8px;
		}

		> .body {
			display: flex;
			inline-size: calc(100% - 54px);
			position: relative;

			> .name {
				inline-size: 45%;

				@media (max-inline-size: 500px) {
					inline-size: 100%;
				}

				> .name,
				> .acct {
					display: block;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					margin: 0;
				}

				> .name {
					font-size: 16px;
					line-height: 24px;
				}

				> .acct {
					font-size: 15px;
					line-height: 16px;
					opacity: 0.7;
				}
			}

			> .description {
				inline-size: 55%;
				line-height: 42px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				opacity: 0.7;
				font-size: 14px;
				padding-inline-end: 40px;
				padding-inline-start: 8px;
				box-sizing: border-box;

				@media (max-inline-size: 500px) {
					display: none;
				}
			}

			> .actions {
				position: absolute;
				inset-block-start: 0;
				inset-block-end: 0;
				inset-inline-end: 0;
				margin-block: auto;
				margin-inline: 0;

				> button {
					padding: 12px;
				}
			}
		}
	}
}
</style>
