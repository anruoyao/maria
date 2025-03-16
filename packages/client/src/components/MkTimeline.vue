<template>
	<MkInfo
		v-if="tlHint && !tlHintClosed && isSignedIn(me)"
		:closeable="true"
		class="_gap"
		@close="closeHint"
	>
		<I18n :src="tlHint">
			<template #icon></template>
		</I18n>
	</MkInfo>
	<div v-if="queue > 0" class="new">
		<button
			class="_buttonPrimary _shadow"
			:class="{ instant: !defaultStore.state.animation }"
			@click="tlComponent?.scrollTop()"
		>
			{{ i18n.ts.newNoteRecived }}
			<i :class="icon('ph-arrow-up ph-dir', false)"></i>
		</button>
	</div>
	<MkPullToRefresh
		v-if="defaultStore.state.enablePullToRefresh"
		ref="pullToRefreshComponent"
		:refresher="() => reloadTimeline()"
	>
		<XNotes
			ref="tlComponent"
			:no-gap="!defaultStore.state.showGapBetweenNotesInTimeline"
			:pagination="pagination"
			:folder
			@queue="(x) => (queue = x)"
			@status="pullToRefreshComponent?.setDisabled($event)"
		/>
	</MkPullToRefresh>
	<XNotes
		v-else
		ref="tlComponent"
		:no-gap="!defaultStore.state.showGapBetweenNotesInTimeline"
		:pagination="pagination"
		:folder
		@queue="(x) => (queue = x)"
		@status="pullToRefreshComponent?.setDisabled($event)"
	/>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, provide, ref } from "vue";
import type { StreamTypes, TypeUtils, entities } from "firefish-js";
import MkPullToRefresh from "@/components/MkPullToRefresh.vue";
import XNotes from "@/components/MkNotes.vue";
import MkInfo from "@/components/MkInfo.vue";
import { useStream } from "@/stream";
import * as sound from "@/scripts/sound";
import { isSignedIn, me } from "@/me";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";
import { foldNotes } from "@/scripts/fold";
import type { NoteType } from "@/types/note";

export type TimelineSource =
	| "antenna"
	| "home"
	| "local"
	| "recommended"
	| "social"
	| "global"
	| "mentions"
	| "directs"
	| "list"
	| "channel"
	| "file";

const props = defineProps<{
	src: TimelineSource;
	list?: string;
	antenna?: string;
	channel?: string;
	sound?: boolean;
	fileId?: string;
}>();

const emit = defineEmits<{
	(ev: "note"): void;
	(ev: "queue", count: number): void;
}>();

const tlComponent = ref<InstanceType<typeof XNotes>>();
const pullToRefreshComponent = ref<InstanceType<typeof MkPullToRefresh>>();

const folder = computed(() => {
	const mergeThread = defaultStore.reactiveState.mergeThreadInTimeline.value;
	const mergeRenotes = defaultStore.reactiveState.mergeRenotesInTimeline.value;
	return (ns: NoteType[]) => foldNotes(ns, mergeThread, mergeRenotes);
});

let endpoint: TypeUtils.EndpointsOf<entities.Note[]>; // keyof Endpoints
let query: {
	antennaId?: string | undefined;
	withReplies?: boolean;
	visibility?: string;
	listId?: string | undefined;
	channelId?: string | undefined;
	fileId?: string | undefined;
} = {};

// FIXME: The type defination is wrong here, need fix
let connection:
	| StreamTypes.ChannelOf<"antenna">
	| StreamTypes.ChannelOf<"homeTimeline">
	| StreamTypes.ChannelOf<"recommendedTimeline">
	| StreamTypes.ChannelOf<"hybridTimeline">
	| StreamTypes.ChannelOf<"globalTimeline">
	| StreamTypes.ChannelOf<"main">
	| StreamTypes.ChannelOf<"userList">
	| StreamTypes.ChannelOf<"channel">;

let connection2: { dispose: () => void } | null;

let tlHint: string;
let tlHintClosed: boolean;
let tlNotesCount = 0;
const queue = ref(0);

const prepend = (note: entities.Note) => {
	tlNotesCount++;
	tlComponent.value?.pagingComponent?.prepend(note);

	emit("note");

	if (props.sound) {
		sound.play(isSignedIn(me) && note.userId === me?.id ? "noteMy" : "note");
	}
};

if (props.src === "antenna") {
	endpoint = "antennas/notes";
	query = {
		antennaId: props.antenna,
	};
} else if (props.src === "home") {
	endpoint = "notes/timeline";
	query = {
		withReplies: defaultStore.state.showTimelineReplies,
	};
	tlHint = i18n.ts._tutorial.step5_3;
	tlHintClosed = defaultStore.state.tlHomeHintClosed;
} else if (props.src === "local") {
	endpoint = "notes/local-timeline";
	query = {
		withReplies: defaultStore.state.showTimelineReplies,
	};
	tlHint = i18n.ts._tutorial.step5_4;
	tlHintClosed = defaultStore.state.tlLocalHintClosed;
} else if (props.src === "recommended") {
	endpoint = "notes/recommended-timeline";
	query = {
		withReplies: defaultStore.state.showTimelineReplies,
	};
	tlHint = i18n.ts._tutorial.step5_6;
	tlHintClosed = defaultStore.state.tlRecommendedHintClosed;
} else if (props.src === "social") {
	endpoint = "notes/hybrid-timeline";
	query = {
		withReplies: defaultStore.state.showTimelineReplies,
	};
	tlHint = i18n.ts._tutorial.step5_5;
	tlHintClosed = defaultStore.state.tlSocialHintClosed;
} else if (props.src === "global") {
	endpoint = "notes/global-timeline";
	query = {
		withReplies: defaultStore.state.showTimelineReplies,
	};
	tlHint = i18n.ts._tutorial.step5_7;
	tlHintClosed = defaultStore.state.tlGlobalHintClosed;
} else if (props.src === "mentions") {
	endpoint = "notes/mentions";
} else if (props.src === "directs") {
	endpoint = "notes/mentions";
	query = {
		visibility: "specified",
	};
} else if (props.src === "list") {
	endpoint = "notes/user-list-timeline";
	query = {
		listId: props.list,
	};
} else if (props.src === "channel") {
	endpoint = "channels/timeline";
	query = {
		channelId: props.channel,
	};
} else if (props.src === "file") {
	endpoint = "drive/files/attached-notes";
	query = {
		fileId: props.fileId,
	};
} else {
	throw "NoEndpointError";
}

const stream = useStream();

function connectChannel() {
	if (props.src === "mentions") {
		connection = stream.useChannel("main");
		connection.on("mention", prepend);
		return;
	}
	if (props.src === "directs") {
		const onNote = (note) => {
			if (note.visibility === "specified") {
				prepend(note);
			}
		};
		connection = stream.useChannel("main");
		connection.on("mention", onNote);
		return;
	}
	if (props.src === "file") {
		return;
	}

	if (props.src === "antenna") {
		if (!props.antenna) throw "NoAntennaProvided";
		connection = stream.useChannel("antenna", {
			antennaId: props.antenna,
		});
	} else if (props.src === "home") {
		connection = stream.useChannel("homeTimeline", {
			withReplies: defaultStore.state.showTimelineReplies,
		});
		connection2 = stream.useChannel("main");
	} else if (props.src === "local") {
		connection = stream.useChannel("localTimeline", {
			withReplies: defaultStore.state.showTimelineReplies,
		});
	} else if (props.src === "recommended") {
		connection = stream.useChannel("recommendedTimeline", {
			withReplies: defaultStore.state.showTimelineReplies,
		});
	} else if (props.src === "social") {
		connection = stream.useChannel("hybridTimeline", {
			withReplies: defaultStore.state.showTimelineReplies,
		});
	} else if (props.src === "global") {
		connection = stream.useChannel("globalTimeline", {
			withReplies: defaultStore.state.showTimelineReplies,
		});
	} else if (props.src === "list") {
		connection = stream.useChannel("userList", {
			listId: props.list,
		});
	} else if (props.src === "channel") {
		connection = stream.useChannel("channel", {
			channelId: props.channel,
		});
	}
	connection.on("note", prepend);
}

provide(
	"inChannel",
	computed(() => props.src === "channel"),
);

function closeHint() {
	switch (props.src) {
		case "home":
			defaultStore.set("tlHomeHintClosed", true);
			break;
		case "local":
			defaultStore.set("tlLocalHintClosed", true);
			break;
		case "recommended":
			defaultStore.set("tlRecommendedHintClosed", true);
			break;
		case "social":
			defaultStore.set("tlSocialHintClosed", true);
			break;
		case "global":
			defaultStore.set("tlGlobalHintClosed", true);
			break;
	}
}

if (defaultStore.state.enableTimelineStreaming) {
	connectChannel();
	onUnmounted(() => {
		connection.dispose();
		if (connection2) connection2.dispose();
	});
}

function reloadTimeline() {
	return new Promise<void>((res) => {
		tlNotesCount = 0;
		tlComponent.value?.pagingComponent?.reload().then(() => {
			res();
		});
	});
}

const pagination = {
	endpoint,
	limit: 10,
	params: query,
};

onUnmounted(() => {
	connection.dispose();
	if (connection2 != null) connection2.dispose();
});

/* TODO
const timetravel = (date?: Date) => {
	this.date = date;
	this.$refs.tl.reload();
};
*/

defineExpose({
	reloadTimeline,
});
</script>
<style lang="scss" scoped>
@keyframes slideUp {
	to {
		transform: translateY(-100%);
		opacity: 0;
	}
}
.new {
	position: sticky;
	display: flex;
	justify-content: center;
	inset-block-start: calc(var(--stickyTop, 0px) - 60px);
	inline-size: 600px;
	max-inline-size: 100%;
	block-size: 60px;
	pointer-events: none;
	margin: auto;
	margin-block-start: -60px;
	z-index: 1001;
	box-shadow: 0 24px 24px -20px var(--accentedBg);
	&::after {
		content: "";
		position: absolute;
		inset: -2px 0;
		border-block-end: 2px solid var(--accentDarken);
		mask: linear-gradient(
			var(--gradient-to-inline-end),
			transparent,
			black 40% 60%,
			transparent
		);
		-webkit-mask: linear-gradient(
			var(--gradient-to-inline-end),
			transparent,
			black 40% 60%,
			transparent
		);
	}
	> button {
		display: flex;
		position: absolute;
		inset-block-start: 120%;
		margin-inline: auto;
		border-radius: 2em;
		padding-block: 0.5em;
		padding-inline: 1.2em;
		background: var(--accentedBg);
		border: 0;
		color: var(--accent);
		overflow: hidden;
		pointer-events: all;
		transform: translateY(-100%);
		opacity: 0;
		animation:
			reset 0.4s forwards cubic-bezier(0, 0.4, 0, 1.1),
			slideUp 1s 5s forwards cubic-bezier(1, 0, 1, 1);
		&::before {
			content: "";
			position: absolute;
			inset: 0;
			background: var(--bg);
			z-index: -1;
		}
		i {
			margin-inline-start: 0.7em;
			border-inline-start: 1px solid var(--accentedBg);
			padding-inline-start: 0.4em;
		}
	}
}
</style>
