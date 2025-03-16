<template>
	<MkModal
		ref="modal"
		:z-priority="'high'"
		:src="src"
		@click="modal!.close()"
		@closed="emit('closed')"
	>
		<div class="_popup" :class="$style.root">
			<button
				key="public"
				class="_button"
				:class="[$style.item, { [$style.active]: v === 'public' }]"
				data-index="1"
				@click="choose('public')"
			>
				<div :class="$style.icon">
					<i :class="icon('ph-planet')"></i>
				</div>
				<div :class="$style.body">
					<span :class="$style.itemTitle">{{
						i18n.ts._visibility.public
					}}</span>
					<span :class="$style.itemDescription">{{
						i18n.ts._visibility.publicDescription
					}}</span>
				</div>
			</button>
			<button
				key="home"
				class="_button"
				:class="[$style.item, { [$style.active]: v === 'home' }]"
				data-index="2"
				@click="choose('home')"
			>
				<div :class="$style.icon">
					<i :class="icon('ph-house')"></i>
				</div>
				<div :class="$style.body">
					<span :class="$style.itemTitle">{{
						i18n.ts._visibility.home
					}}</span>
					<span :class="$style.itemDescription">{{
						i18n.ts._visibility.homeDescription
					}}</span>
				</div>
			</button>
			<button
				key="followers"
				class="_button"
				:class="[$style.item, { [$style.active]: v === 'followers' }]"
				data-index="3"
				@click="choose('followers')"
			>
				<div :class="$style.icon">
					<i :class="icon('ph-lock')"></i>
				</div>
				<div :class="$style.body">
					<span :class="$style.itemTitle">{{
						i18n.ts._visibility.followers
					}}</span>
					<span :class="$style.itemDescription">{{
						i18n.ts._visibility.followersDescription
					}}</span>
				</div>
			</button>
			<button
				key="specified"
				:disabled="localOnly"
				class="_button"
				:class="[$style.item, { [$style.active]: v === 'specified' }]"
				data-index="4"
				@click="choose('specified')"
			>
				<div :class="$style.icon">
					<i :class="icon('ph-envelope-simple-open')"></i>
				</div>
				<div :class="$style.body">
					<span :class="$style.itemTitle">{{
						i18n.ts._visibility.specified
					}}</span>
					<span :class="$style.itemDescription">{{
						i18n.ts._visibility.specifiedDescription
					}}</span>
				</div>
			</button>
			<button
				key="private"
				class="_button"
				:class="[$style.item, { [$style.active]: v === 'private' }]"
				data-index="5"
				@click="choose('private')"
			>
				<div :class="$style.icon">
					<i :class="icon('ph-eye-slash')"></i>
				</div>
				<div :class="$style.body">
					<span :class="$style.itemTitle">{{ i18n.ts.private }}</span>
					<span :class="$style.itemDescription">{{
						i18n.ts.privateDescription
					}}</span>
				</div>
			</button>
			<div :class="$style.divider"></div>
			<button
				key="localOnly"
				class="_button"
				:class="[
					$style.item,
					$style.localOnly,
					{ [$style.active]: localOnly },
				]"
				data-index="5"
				@click="localOnly = !localOnly"
			>
				<div :class="$style.icon">
					<i :class="icon('ph-users')"></i>
				</div>
				<div :class="$style.body">
					<span :class="$style.itemTitle">{{
						i18n.ts._visibility.localOnly
					}}</span>
					<span :class="$style.itemDescription">{{
						i18n.ts._visibility.localOnlyDescription
					}}</span>
				</div>
				<div :class="$style.toggle">
					<i
						:class="
							icon(
								localOnly
									? 'ph-toggle-right ph-dir'
									: 'ph-toggle-left ph-dir',
							)
						"
					></i>
				</div>
			</button>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { nextTick, ref, shallowRef, watch } from "vue";
import MkModal from "@/components/MkModal.vue";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";
import type { NoteVisibility } from "@/types/note";

const modal = shallowRef<InstanceType<typeof MkModal>>();

const props = withDefaults(
	defineProps<{
		currentVisibility: NoteVisibility;
		currentLocalOnly: boolean;
		src?: HTMLElement | null;
	}>(),
	{},
);

const emit = defineEmits<{
	changeVisibility: [v: NoteVisibility];
	changeLocalOnly: [v: boolean];
	closed: [];
}>();

const v = ref(props.currentVisibility);
const localOnly = ref(props.currentLocalOnly);

watch(localOnly, () => {
	emit("changeLocalOnly", localOnly.value);
});

function choose(visibility: NoteVisibility): void {
	v.value = visibility;
	emit("changeVisibility", visibility);
	nextTick(() => {
		modal.value!.close();
	});
}
</script>

<style lang="scss" module>
.root {
	inline-size: 240px;
	padding-block: 8px;
	padding-inline: 0;
}

.divider {
	margin-block: 8px;
	margin-inline: 0;
	border-block-start: solid 0.5px var(--divider);
}

.item {
	display: flex;
	padding-block: 8px;
	padding-inline: 14px;
	font-size: 12px;
	text-align: start;
	inline-size: 100%;
	box-sizing: border-box;

	&:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	&:active {
		background: rgba(0, 0, 0, 0.1);
	}

	&.active {
		color: var(--fgOnAccent);
		background: var(--accent);
	}

	&.localOnly.active {
		color: var(--accent);
		background: inherit;
	}
}

.icon {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-inline-end: 10px;
	inline-size: 16px;
	inset-block-start: 0;
	inset-block-end: 0;
	margin-block-start: auto;
	margin-block-end: auto;
}

.body {
	flex: 1 1 auto;
	overflow: hidden;
	text-overflow: ellipsis;
}

.itemTitle {
	display: block;
	font-weight: bold;
}

.itemDescription {
	opacity: 0.6;
	display: block;
	line-height: 1.5;
}

.toggle {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-inline-start: 10px;
	inline-size: 16px;
	inset-block-start: 0;
	inset-block-end: 0;
	margin-block-start: auto;
	margin-block-end: auto;
}
</style>
