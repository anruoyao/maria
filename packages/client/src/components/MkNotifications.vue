<template>
	<MkPagination
		ref="pagingComponent" 
		:pagination="pagination"
		:folder="convertNotification"
	>
		<template #empty>
			<div class="_fullinfo">
				<img
					src="/static-assets/badges/info.webp"
					class="_ghost"
					alt="Info"
				/>
				<div>{{ i18n.ts.noNotifications }}</div>
			</div>
		</template>

		<template #default="{ foldedItems: notifications }">
			<XList
				v-slot="{ item: notification }"
				:items="notifications"
				class="elsfgstc"
				:no-gap="true"
			>
				<XNotificationFolded
					v-if="isFoldedNotification(notification)"
					:key="'nf-' + notification.id"
					:notification="notification"
					:with-time="true"
					:full="true"
					class="_panel notification"
				/>
				<XNote
					v-else-if="isNoteNotification(notification)"
					:key="'nn-' + notification.id"
					:note="notification.note"
					:collapsed-reply="
						notification.type === 'reply' ||
						(notification.type === 'mention' &&
							notification.note.replyId != null)
					"
				/>
				<XNotification
					v-else
					:key="'n-' + notification.id"
					:notification="notification"
					:with-time="true"
					:full="true"
					class="_panel notification"
				/>
			</XList>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { StreamTypes, entities, notificationTypes } from "firefish-js";
import MkPagination, {
	type MkPaginationType,
} from "@/components/MkPagination.vue";
import XNotification from "@/components/MkNotification.vue";
import XNotificationFolded from "@/components/MkNotificationFolded.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import XNote from "@/components/MkNote.vue";
import { useStream } from "@/stream";
import { me } from "@/me";
import { i18n } from "@/i18n";
import type { NotificationFolded } from "@/types/notification";
import { foldNotifications } from "@/scripts/fold";
import { defaultStore } from "@/store";

const props = defineProps<{
	includeTypes?: (typeof notificationTypes)[number][] | null;
	unreadOnly?: boolean;
}>();

const stream = useStream();

const pagingComponent = ref<MkPaginationType<"i/notifications"> | null>(null);

const shouldFold = defaultStore.reactiveState.foldNotification;

const convertNotification = computed(() =>
	shouldFold.value ? foldNotifications : (ns: entities.Notification[]) => ns,
);

const FETCH_LIMIT = 90;

const pagination = computed(() =>
	Object.assign(
		{
			endpoint: "i/notifications" as const,
			params: computed(() => ({
				includeTypes: props.includeTypes ?? undefined,
				excludeTypes: props.includeTypes
					? undefined
					: me?.mutingNotificationTypes,
				unreadOnly: props.unreadOnly,
			})),
		},
		shouldFold.value
			? {
					limit: 50,
					secondFetchLimit: FETCH_LIMIT,
				}
			: {
					limit: 30,
				},
	),
);

function isNoteNotification(
	n: entities.Notification,
): n is
	| entities.ReplyNotification
	| entities.QuoteNotification
	| entities.MentionNotification {
	return n.type === "reply" || n.type === "quote" || n.type === "mention";
}
function isFoldedNotification(
	n: NotificationFolded | entities.Notification,
): n is NotificationFolded {
	return "folded" in n;
}

const onNotification = (notification: entities.Notification) => {
	const isMuted = props.includeTypes
		? !props.includeTypes.includes(notification.type)
		: me?.mutingNotificationTypes.includes(notification.type);
	if (isMuted || document.visibilityState === "visible") {
		stream.send("readNotification", {
			id: notification.id,
		});
	}

	if (!isMuted) {
		pagingComponent.value?.prepend({
			...notification,
			isRead: document.visibilityState === "visible",
		});
	}
};

let connection: StreamTypes.ChannelOf<"main"> | undefined;

onMounted(() => {
	connection = stream.useChannel("main");
	connection.on("notification", onNotification);
	connection.on("readAllNotifications", () => {
		if (pagingComponent.value) {
			for (const item of pagingComponent.value.queue) {
				item.isRead = true;
			}
			for (const item of pagingComponent.value.items) {
				item.isRead = true;
			}
		}
	});
	connection.on("readNotifications", (notificationIds) => {
		if (pagingComponent.value) {
			for (let i = 0; i < pagingComponent.value.queue.length; i++) {
				if (notificationIds.includes(pagingComponent.value.queue[i].id)) {
					pagingComponent.value.queue[i].isRead = true;
				}
			}
			for (let i = 0; i < (pagingComponent.value.items || []).length; i++) {
				if (notificationIds.includes(pagingComponent.value.items[i].id)) {
					pagingComponent.value.items[i].isRead = true;
				}
			}
		}
	});
});

onUnmounted(() => {
	if (connection) connection.dispose();
});
</script>

<style lang="scss" scoped>
.elsfgstc {
	background: var(--panel);
	border-radius: var(--radius);
}
</style>
