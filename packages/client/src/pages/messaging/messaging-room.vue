<template>
	<div
		ref="rootEl"
		class="_section"
		@dragover.prevent.stop="onDragover"
		@drop.prevent.stop="onDrop"
	>
		<div class="_content mk-messaging-room">
			<MkSpacer :content-max="800">
				<div class="body">
					<MkPagination
						v-if="pagination"
						ref="pagingComponent"
						:key="userAcct || groupId"
						:pagination="pagination"
					>
						<template #empty>
							<div class="_fullinfo">
								<img
									src="/static-assets/badges/info.webp"
									class="_ghost"
									alt="Info"
								/>
								<div>{{ i18n.ts.noMessagesYet }}</div>
							</div>
						</template>
						<template
							#default="{ items: messages, fetching: pFetching }"
						>
							<XList
								v-if="messages.length > 0"
								v-slot="{ item: message }"
								aria-live="polite"
								:class="{
									messages: true,
									'deny-move-transition': pFetching,
								}"
								:items="messages"
								direction="up"
								reversed
							>
								<XMessage
									:key="message.id"
									:message="message"
									:is-group="group != null"
								/>
							</XList>
						</template>
					</MkPagination>
				</div>
				<footer>
					<div
						v-if="typers.length > 0"
						class="typers"
						aria-live="polite"
					>
						<I18n
							:src="i18n.ts.typingUsers"
							text-tag="span"
							class="users"
						>
							<template #users>
								<b
									v-for="typer in typers"
									:key="typer.id"
									class="user"
									>{{ typer.username }}</b
								>
							</template>
						</I18n>
						<MkEllipsis />
					</div>
					<transition :name="animation ? 'fade' : ''">
						<div v-show="showIndicator" class="new-message">
							<button
								class="_buttonPrimary"
								@click="onIndicatorClick"
							>
								<i
									class="fas ph-fw ph-arrow-circle-down-bold ph-lg"
								></i
								>{{ i18n.ts.newMessageExists }}
							</button>
						</div>
					</transition>
					<XForm
						v-if="!fetching"
						ref="formEl"
						:user="user"
						:group="group"
						class="form"
					/>
				</footer>
			</MkSpacer>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
} from "vue";
import type { ChannelConnection, Channels, entities } from "firefish-js";
import { acct } from "firefish-js";
import XMessage from "./messaging-room.message.vue";
import XForm from "./messaging-room.form.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import type { MkPaginationType, Paging } from "@/components/MkPagination.vue";
import MkPagination from "@/components/MkPagination.vue";
import {
	isBottomVisible,
	onScrollBottom,
	scrollToBottom,
} from "@/scripts/scroll";
import * as os from "@/os";
import { useStream } from "@/stream";
import * as sound from "@/scripts/sound";
import { vibrate } from "@/scripts/vibrate";
import { i18n } from "@/i18n";
import { me } from "@/me";
import { defaultStore } from "@/store";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const props = defineProps<{
	userAcct?: string;
	groupId?: string;
}>();

const stream = useStream();

const rootEl = ref<HTMLDivElement>();
const formEl = ref<InstanceType<typeof XForm>>();
const pagingComponent = ref<MkPaginationType<"messaging/messages"> | null>(
	null,
);

const fetching = ref(true);
const user = ref<entities.UserDetailed | null>(null);
const group = ref<entities.UserGroup | null>(null);
const typers = ref<entities.User[]>([]);
const connection: ChannelConnection<Channels["messaging"]> | null = ref(null);
const showIndicator = ref(false);
const { animation } = defaultStore.reactiveState;

const pagination = ref<Paging | null>(null);

watch([() => props.userAcct, () => props.groupId], () => {
	if (connection.value) connection.value.dispose();
	fetch();
});

async function fetch() {
	fetching.value = true;

	if (props.userAcct) {
		const account = acct.parse(props.userAcct);
		user.value = await os.api("users/show", {
			username: account.username,
			host: account.host || undefined,
		});
		group.value = null;

		pagination.value = {
			endpoint: "messaging/messages",
			limit: 20,
			params: {
				userId: user.value.id,
			},
			reversed: true,
			pageEl: rootEl.value,
		};
		connection.value = stream.useChannel("messaging", {
			otherparty: user.value.id,
		});
	} else {
		user.value = null;
		group.value = await os.api("users/groups/show", {
			groupId: props.groupId,
		});

		pagination.value = {
			endpoint: "messaging/messages",
			limit: 20,
			params: {
				groupId: group.value?.id,
			},
			reversed: true,
			pageEl: rootEl.value,
		};
		connection.value = stream.useChannel("messaging", {
			group: group.value?.id,
		});
	}

	connection.value.on("message", onMessage);
	connection.value.on("read", onRead);
	connection.value.on("deleted", onDeleted);
	connection.value.on("typers", (_typers) => {
		typers.value = _typers.filter((u) => u.id !== me?.id);
	});

	document.addEventListener("visibilitychange", onVisibilitychange);

	nextTick(() => {
		// thisScrollToBottom();
		window.setTimeout(() => {
			fetching.value = false;
		}, 300);
	});
}

function onDragover(ev: DragEvent) {
	if (!ev.dataTransfer) return;

	const isFile = ev.dataTransfer.items[0].kind === "file";
	const isDriveFile = ev.dataTransfer.types[0] === _DATA_TRANSFER_DRIVE_FILE_;

	if (isFile || isDriveFile) {
		ev.dataTransfer.dropEffect =
			ev.dataTransfer.effectAllowed === "all" ? "copy" : "move";
	} else {
		ev.dataTransfer.dropEffect = "none";
	}
}

function onDrop(ev: DragEvent): void {
	if (!ev.dataTransfer) return;

	// ファイルだったら
	if (ev.dataTransfer.files.length === 1) {
		formEl.value.upload(ev.dataTransfer.files[0]);
		return;
	} else if (ev.dataTransfer.files.length > 1) {
		os.alert({
			type: "error",
			text: i18n.ts.onlyOneFileCanBeAttached,
		});
		return;
	}

	// #region ドライブのファイル
	const driveFile = ev.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
	if (driveFile != null && driveFile !== "") {
		const file = JSON.parse(driveFile);
		formEl.value.file = file;
	}
	// #endregion
}

function onMessage(message) {
	sound.play("chat");
	vibrate([30, 30, 30]);

	const _isBottom = isBottomVisible(rootEl.value, 64);

	pagingComponent.value.prepend(message);
	if (message.userId !== me?.id && !document.hidden) {
		connection.value?.send("read", {
			id: message.id,
		});
	}

	if (_isBottom) {
		// Scroll to bottom
		nextTick(() => {
			thisScrollToBottom();
		});
	} else if (message.userId !== me?.id) {
		// Notify
		notifyNewMessage();
	}
}

function onRead(x) {
	if (user.value) {
		if (!Array.isArray(x)) x = [x];
		for (const id of x) {
			if (pagingComponent.value.items.some((y) => y.id === id)) {
				const exist = pagingComponent.value.items.map((y) => y.id).indexOf(id);
				pagingComponent.value.items[exist] = {
					...pagingComponent.value.items[exist],
					isRead: true,
				};
			}
		}
	} else if (group.value) {
		for (const id of x.ids) {
			if (pagingComponent.value.items.some((y) => y.id === id)) {
				const exist = pagingComponent.value.items.map((y) => y.id).indexOf(id);
				pagingComponent.value.items[exist] = {
					...pagingComponent.value.items[exist],
					reads: [...pagingComponent.value.items[exist].reads, x.userId],
				};
			}
		}
	}
}

function onDeleted(id) {
	const msg = pagingComponent.value.items.find((m) => m.id === id);
	if (msg) {
		pagingComponent.value.items = pagingComponent.value.items.filter(
			(m) => m.id !== msg.id,
		);
	}
}

function thisScrollToBottom() {
	if (window.location.href.includes("my/messaging/")) {
		scrollToBottom(rootEl.value, { behavior: "smooth" });
	}
}

function onIndicatorClick() {
	showIndicator.value = false;
	thisScrollToBottom();
}

const scrollRemove = ref<(() => void) | null>(null);

function notifyNewMessage() {
	showIndicator.value = true;

	scrollRemove.value = onScrollBottom(rootEl.value, () => {
		showIndicator.value = false;
		scrollRemove.value = null;
	});
}

function onVisibilitychange() {
	if (document.hidden) return;
	for (const message of pagingComponent.value.items) {
		if (message.userId !== me?.id && !message.isRead) {
			connection.value?.send("read", {
				id: message.id,
			});
		}
	}
}

onMounted(async () => {
	const _meta = {
		title: i18n.ts.messaging,
		icon: `${icon("ph-chats-teardrop-bold")}`,
	};
	definePageMetadata(_meta);
	await fetch();
	_meta.title = `${i18n.ts.messaging} · ${
		group.value != null
			? group.value.name
			: user.value?.name || user.value?.username
	}`;
});

onBeforeUnmount(() => {
	connection.value?.dispose();
	document.removeEventListener("visibilitychange", onVisibilitychange);
	if (scrollRemove.value) scrollRemove.value();
});
</script>

<style lang="scss" scoped>
XMessage:last-of-type {
	margin-block-end: 4rem;
}

.mk-messaging-room {
	position: relative;
	overflow: auto;

	> .body {
		.more {
			display: block;
			margin-block: 16px;
			margin-inline: auto;
			padding-block: 0;
			padding-inline: 12px;
			line-height: 24px;
			color: #fff;
			background: rgba(#000, 0.3);
			border-radius: 12px;

			&:hover {
				background: rgba(#000, 0.4);
			}

			&:active {
				background: rgba(#000, 0.5);
			}

			&.fetching {
				cursor: wait;
			}

			> i {
				margin-inline-end: 4px;
			}
		}

		.messages {
			padding-block: 8px;
			padding-inline: 0;

			> ::v-deep(*) {
				margin-block-end: 16px;
			}
		}
	}

	> footer {
		inline-size: 100%;
		position: sticky;
		z-index: 2;
		inset-block-end: 0;
		padding-block-start: 8px;
		inset-block-end: calc(env(safe-area-inset-bottom, 0px) + 8px);

		> .new-message {
			inline-size: 100%;
			padding-block-end: 8px;
			text-align: center;

			> button {
				display: inline-block;
				margin: 0;
				padding-block: 0;
				padding-inline: 12px;
				line-height: 32px;
				font-size: 12px;
				border-radius: 16px;

				> i {
					display: inline-block;
					margin-inline-end: 8px;
				}
			}
		}

		> .typers {
			position: absolute;
			inset-block-end: 100%;
			padding-block-start: 0;
			padding-inline-end: 8px;
			padding-block-end: 0;
			padding-inline-start: 8px;
			font-size: 0.9em;
			color: var(--fgTransparentWeak);

			> .users {
				> .user + .user:before {
					content: ", ";
					font-weight: normal;
				}

				> .user:last-of-type:after {
					content: " ";
				}
			}
		}

		> .form {
			max-block-size: 12em;
			overflow-y: scroll;
			overflow-block: scroll;
			border-block-start: solid 0.5px var(--divider);
			
			@supports not (overflow-block: scroll) {
				.vertical-lr &, .vertical-rl & {
					overflow-y: visible;
					overflow-x: scroll;
				}
			}
		}
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.1s;
}

.fade-enter-from,
.fade-leave-to {
	transition: opacity 0.5s;
	opacity: 0;
}
</style>
