<template>
	<MkModal ref="modal" :z-priority="'middle'" @closed="emit('closed')">
		<div :class="$style.root">
			<div :class="$style.title">
				<MkSparkle v-if="isGoodNews">{{ title }}</MkSparkle>
				<p v-else>{{ title }}</p>
			</div>
			<div :class="$style.time">
				<MkTime :time="announcement.createdAt" />
				<div v-if="announcement.updatedAt">
					<small>
						{{ i18n.ts.updatedAt }}:
						<MkTime :time="announcement.createdAt" />
					</small>
				</div>
			</div>
			<Mfm :text="text" />
			<img
				v-if="imageUrl != null"
				:key="imageUrl"
				:src="imageUrl"
				alt="attached image"
			/>
			<MkButton :class="$style.gotIt" primary full @click="gotIt()">{{
				i18n.ts.gotIt
			}}</MkButton>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";
import type { entities } from "firefish-js";
import MkModal from "@/components/MkModal.vue";
import MkSparkle from "@/components/MkSparkle.vue";
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";

const props = defineProps<{
	announcement: entities.Announcement;
}>();

const emit = defineEmits<{
	closed: [];
}>();

const { id, text, title, imageUrl, isGoodNews } = props.announcement;

const modal = shallowRef<InstanceType<typeof MkModal>>();

const gotIt = () => {
	modal.value!.close();
	os.api("i/read-announcement", { announcementId: id });
};
</script>

<style lang="scss" module>
.root {
	margin: auto;
	position: relative;
	padding: 32px;
	min-inline-size: 320px;
	max-inline-size: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);

	> img {
		border-radius: 10px;
		max-block-size: 100%;
		max-inline-size: 100%;
	}
}

.title {
	font-weight: bold;

	> p {
		margin: 0;
	}
}

.time {
	font-size: 0.8rem;
}

.gotIt {
	margin-block-start: 1rem;
	margin-inline-end: 0;
	margin-block-end: 1rem;
	margin-inline-start: 2rem;
}
</style>
