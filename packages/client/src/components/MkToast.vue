<template>
	<div class="mk-toast">
		<transition
			:name="defaultStore.state.animation ? 'toast' : ''"
			appear
			@after-leave="emit('closed')"
		>
			<div v-if="showing" class="body _acrylic" :style="{ zIndex }">
				<Mfm
					class="message"
					:text="message"
					:plain="true"
					:nowrap="nowrap"
				/>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import * as os from "@/os";
import { defaultStore } from "@/store";

defineProps<{
	message: string;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

const zIndex = os.claimZIndex("high");
const showing = ref(true);

onMounted(() => {
	window.setTimeout(() => {
		showing.value = false;
	}, 4000);
});
</script>

<style lang="scss" scoped>
.toast-enter-active,
.toast-leave-active {
	transition:
		opacity 0.3s,
		transform 0.3s !important;
}
.toast-enter-from,
.toast-leave-to {
	opacity: 0;
	transform: translateY(-100%);
}

.mk-toast {
	> .body {
		position: fixed;
		inset-inline-start: 0;
		inset-inline-end: 0;
		inset-block-start: 0;
		margin-block: 0;
		margin-inline: auto;
		margin-block-start: 16px;
		min-inline-size: 300px;
		max-inline-size: calc(100% - 32px);
		inline-size: min-content;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		overflow: clip;
		text-align: center;
		pointer-events: none;

		> .message {
			padding-block: 16px;
			padding-inline: 24px;
		}
	}
}
</style>
