<template>
	<div class="tivcixzd" :class="{ done: closed || isVoted }">
		<ul>
			<li
				v-for="(choice, i) in note.poll.choices"
				:key="i"
				:class="{ voted: choice.voted }"
				@click.stop="vote(i)"
			>
				<div
					class="backdrop"
					:style="{
						inlineSize: `${
							showResult ? (choice.votes / total) * 100 : 0
						}%`,
					}"
				></div>
				<span>
					<template v-if="choice.isVoted"
						><i :class="icon('ph-check')"></i
					></template>
					<Mfm
						:text="choice.text"
						:plain="true"
						:lang="note.lang"
						:custom-emojis="note.emojis"
					/>
					<span v-if="showResult" class="votes"
						>({{
							i18n.t("_poll.votesCount", { n: choice.votes })
						}})</span
					>
				</span>
			</li>
		</ul>
		<p v-if="!readOnly">
			<span>{{ i18n.t("_poll.totalVotes", { n: total }) }}</span>
			<span v-if="!closed && !isVoted">
				<span> · </span>
				<a @click.stop="showResult = !showResult">{{
					showResult ? i18n.ts._poll.vote : i18n.ts._poll.showResult
				}}</a>
			</span>
			<span v-if="!isLocal">
				<span> · </span>
				<a @click.stop="refresh">{{ i18n.ts.reload }}</a>
			</span>
			<span v-if="isVoted"> · {{ i18n.ts._poll.voted }}</span>
			<span v-else-if="closed"> · {{ i18n.ts._poll.closed }}</span>
			<span v-if="remaining > 0"> · {{ timer }}</span>
		</p>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import type { entities } from "firefish-js";
import { sum } from "@/scripts/array";
import { pleaseLogin } from "@/scripts/please-login";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { useInterval } from "@/scripts/use-interval";
import icon from "@/scripts/icon";

const props = defineProps<{
	note: entities.Note;
	readOnly?: boolean;
}>();

const remaining = ref(-1);

const total = computed(() => sum(props.note.poll.choices.map((x) => x.votes)));
const closed = computed(() => remaining.value === 0);
const isLocal = computed(() => !props.note.uri);
const isVoted = computed(
	() =>
		!props.note.poll.multiple && props.note.poll.choices.some((c) => c.isVoted),
);
const timer = computed(() =>
	i18n.t(
		remaining.value >= 86400
			? "_poll.remainingDays"
			: remaining.value >= 3600
				? "_poll.remainingHours"
				: remaining.value >= 60
					? "_poll.remainingMinutes"
					: "_poll.remainingSeconds",
		{
			s: Math.floor(remaining.value % 60),
			m: Math.floor(remaining.value / 60) % 60,
			h: Math.floor(remaining.value / 3600) % 24,
			d: Math.floor(remaining.value / 86400),
		},
	),
);

const showResult = ref(props.readOnly || isVoted.value);

// 期限付きアンケート
if (props.note.poll.expiresAt) {
	const tick = () => {
		remaining.value = Math.floor(
			Math.max(new Date(props.note.poll.expiresAt).getTime() - Date.now(), 0) /
				1000,
		);
		if (remaining.value === 0) {
			showResult.value = true;
		}
	};

	useInterval(tick, 3000, {
		immediate: true,
		afterMounted: false,
	});
}

async function refresh() {
	if (!props.note.uri) return;
	const obj = await os.apiWithDialog("ap/show", { uri: props.note.uri });
	if (obj.type === "Note" && obj.object.poll) {
		props.note.poll = obj.object.poll;
	}
}

const vote = async (id) => {
	pleaseLogin();

	if (props.readOnly || closed.value || isVoted.value) return;

	const { canceled } = await os.confirm({
		type: "question",
		text: i18n.t("voteConfirm", {
			choice: props.note.poll.choices[id].text,
		}),
	});
	if (canceled) return;

	await os.api("notes/polls/vote", {
		noteId: props.note.id,
		choice: id,
	});
	if (!showResult.value) showResult.value = !props.note.poll.multiple;
};
</script>

<style lang="scss" scoped>
.tivcixzd {
	> ul {
		display: block;
		margin: 0;
		padding: 0;
		list-style: none;

		> li {
			display: block;
			position: relative;
			margin-block: 4px;
			margin-inline: 0;
			padding: 4px;
			//border: solid 0.5px var(--divider);
			background: var(--accentedBg);
			border-radius: 4px;
			overflow: hidden;
			cursor: pointer;

			> .backdrop {
				position: absolute;
				inset-block-start: 0;
				inset-inline-start: 0;
				block-size: 100%;
				background: var(--accent);
				background: linear-gradient(
					var(--gradient-to-inline-end),
					var(--buttonGradateA),
					var(--buttonGradateB)
				);
				transition: width 1s ease;
			}

			> span {
				position: relative;
				display: inline-block;
				padding-block: 3px;
				padding-inline: 5px;
				background: var(--panel);
				border-radius: 3px;

				> i {
					margin-inline-end: 4px;
					color: var(--accent);
				}

				> .votes {
					margin-inline-start: 4px;
					opacity: 0.7;
				}
			}
		}
	}

	> p {
		color: var(--fg);

		a {
			color: inherit;
		}
	}

	&.done {
		> ul > li {
			cursor: default;
		}
	}
}
</style>
