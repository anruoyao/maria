<template>
	<div v-size="{ min: [350, 500] }" class="fefdfafb">
		<MkAvatar class="avatar" :user="me!" disable-link />
		<div class="main">
			<div class="header">
				<MkUserName :user="me!" />
			</div>
			<div class="body">
				<div class="content">
					<Mfm
						:text="preprocess(text).trim()"
						:lang="lang"
						:author="me"
						:i="me"
						advanced-mfm
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import preprocess from "@/scripts/preprocess";
import { me } from "@/me";

defineProps<{
	text: string;
	lang?: string;
}>();
</script>

<style lang="scss" scoped>
.fefdfafb {
	display: flex;
	margin: 0;
	padding: 0;
	overflow: clip;
	font-size: 0.95em;

	&.min-width_350px {
		> .avatar {
			margin-block-start: 0;
			margin-inline-end: 10px;
			margin-block-end: 0;
			margin-inline-start: 0;
			inline-size: 44px;
			block-size: 44px;
		}
	}

	&.min-width_500px {
		> .avatar {
			margin-block-start: 0;
			margin-inline-end: 12px;
			margin-block-end: 0;
			margin-inline-start: 0;
			inline-size: 48px;
			block-size: 48px;
		}
	}

	> .avatar {
		flex-shrink: 0;
		display: block;
		margin-block-start: 0;
		margin-inline-end: 10px;
		margin-block-end: 0;
		margin-inline-start: 0;
		inline-size: 40px;
		block-size: 40px;
		border-radius: 8px;
		pointer-events: none;
	}

	> .main {
		flex: 1;
		min-inline-size: 0;

		> .header {
			margin-block-end: 2px;
			font-weight: bold;
		}

		> .body {
			> .cw {
				cursor: default;
				display: block;
				margin: 0;
				padding: 0;
				overflow-wrap: break-word;

				> .text {
					margin-inline-end: 8px;
				}
			}

			> .content {
				> .text {
					cursor: default;
					margin: 0;
					padding: 0;
				}
			}
		}
	}
}
</style>
