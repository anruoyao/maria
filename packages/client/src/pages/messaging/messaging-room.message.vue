<template>
	<div v-size="{ max: [400, 500] }" class="thvuemwp" :class="{ isMe }">
		<MkAvatar v-if="!isMe" class="avatar" :user="message.user" :show-indicator="true" />
		<div class="content">
			<div class="balloon" :class="{ noText: message.text == null }">
				<button v-if="isMe" class="delete-button" :title="i18n.ts.delete" @click="del">
					<i style="color: var(--accentLighten)" class="ph-x-circle ph-fill"></i>
				</button>
				<div v-if="!message.isDeleted" class="content">
					<Mfm v-if="message.text" ref="text" class="text" :text="message.text" :i="me" />
				</div>
				<div v-else class="content">
					<p class="is-deleted">{{ i18n.ts.deleted }}</p>
				</div>
			</div>
			<div v-if="message.file" class="file" width="400px">
				<XMediaList v-if="fileTypeCategory === 'image' || fileTypeCategory === 'video'" :in-dm="true"
					width="400px" :media-list="[message.file]" style="border-radius: 5px" />
				<a v-else :href="message.file.url" rel="noopener" target="_blank" :title="message.file.name">
					<p>{{ message.file.name }}</p>
				</a>
			</div>
			<MkUrlPreview v-for="url in urls" :key="url" :url="url" style="margin: 8px 0" />
			<footer>
				<template v-if="isGroup">
					<span v-if="message.reads.length > 0" class="read">{{ i18n.ts.messageRead }}
						{{ message.reads.length }}</span>
				</template>
				<template v-else>
					<span v-if="isMe && message.isRead" class="read">{{
						i18n.ts.messageRead
					}}</span>
				</template>
				<MkTime :time="message.createdAt" />
				<template v-if="message.is_edited"><i :class="icon('ph-pencil')"></i></template>
			</footer>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import * as mfm from "mfm-js";
import type { entities } from "firefish-js";
import XMediaList from "@/components/MkMediaList.vue";
import { extractUrlFromMfm } from "@/scripts/extract-url-from-mfm";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import * as os from "@/os";
import { me } from "@/me";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

// 扩展 MessagingMessage 类型定义
type ExtendedMessagingMessage = entities.MessagingMessage & {
  isDeleted: boolean;
  is_edited: boolean;
};

const props = defineProps<{
  message: ExtendedMessagingMessage; // 使用扩展后的类型
  isGroup?: boolean;
}>();

const isMe = computed(() => props.message.userId === me?.id);
const urls = computed(() =>
  props.message.text ? extractUrlFromMfm(mfm.parse(props.message.text)) : []
);

// 提取重复代码
const fileTypeCategory = computed(() => {
  if (props.message.file) {
    const typeParts = props.message.file.type.split("/");
    return typeParts.length > 0 ? typeParts[0] : null;
  }
  return null;
});

const text = ref(null);

// 修复异步函数返回类型
async function del(): Promise<void> { // 原第 113 行
  try {
    await os.api("messaging/messages/delete", {
      messageId: props.message.id,
    });
  } catch (error) {
    console.error("删除消息失败:", error);
  }
}
</script>

<style lang="scss" scoped>
// 提取公共变量
$avatar-size: 45px;
$balloon-border-radius: 16px;
$text-padding-block: 12px;
$text-padding-inline: 18px;

.thvuemwp {
	$me-balloon-color: var(--accent);
	--plyr-color-main: var(--accent);

	// plyr 相关样式
	:deep(.plyr__controls) {
		contain: strict;
		block-size: 24px;
		box-sizing: content-box;
	}

	:deep(.plyr__volume) {
		display: flex;
		min-inline-size: max-content;
		inline-size: 110px;
		transition: width 0.2s cubic-bezier(0, 0, 0, 1);

		[data-plyr="volume"] {
			inline-size: 0;
			flex-grow: 1;
			transition: margin 0.3s, opacity 0.2s 0.2s;
		}

		&:not(:hover):not(:focus-within) {
			inline-size: 0px;
			transition: width 0.2s;

			[data-plyr="volume"] {
				margin-inline: 0px;
				opacity: 0;
				transition: margin 0.3s, opacity 0.1s;
			}
		}
	}

	@media (max-width: 480px) {
		:deep(.plyr__volume) {
			inline-size: 80px;
			position: relative;
			z-index: 100;
		}

		:deep([data-plyr="volume"]) {
			inline-size: auto;
			opacity: 1;
			margin-inline: 5px;
		}
	}

	@media (max-width: 767px) {
		:deep(.plyr:not(:fullscreen)) {

			.plyr__control--overlaid,
			.plyr__progress__container,
			.plyr__volume,
			[data-plyr="download"] {
				display: flex;
			}
		}
	}

	@media (max-width: 406px) {
		:deep(.plyr:not(:fullscreen)) {

			.plyr__progress__container,
			.plyr__volume {
				display: flex !important;
			}
		}
	}

	:deep(.plyr) {
		display: block !important;
		flex-direction: unset !important;
		align-items: unset !important;
	}

	position: relative;
	background-color: transparent;
	display: flex;

	.avatar {
		position: sticky;
		inset-block-start: calc(var(--stickyTop, 0px) + 20px);
		display: block;
		inline-size: $avatar-size;
		block-size: $avatar-size;
		transition: all 0.1s ease;
	}

	.content {
		min-inline-size: 0;

		.balloon {
			position: relative;
			display: inline-flex;
			align-items: center;
			padding: 0;
			min-block-size: 38px;
			border-radius: $balloon-border-radius;
			max-inline-size: 100%;

			&+* {
				clear: both;
			}

			&:hover .delete-button {
				display: block;
			}

			.delete-button {
				display: none;
				position: absolute;
				z-index: 1;
				inset-block-start: -4px;
				inset-inline-end: -4px;
				margin: 0;
				padding: 0;
				cursor: pointer;
				outline: none;
				border: none;
				border-radius: 0;
				box-shadow: none;
				background: transparent;

				i {
					vertical-align: bottom;
					cursor: pointer;
				}
			}

			.content {
				max-inline-size: 100%;

				.is-deleted {
					display: block;
					margin: 0;
					padding: 0;
					overflow: hidden;
					overflow-wrap: break-word;
					font-size: 1em;
					color: rgba(#000, 0.5);
				}

				.text {
					display: block;
					margin: 0;
					padding-block: $text-padding-block;
					padding-inline: $text-padding-inline;
					overflow: hidden;
					overflow-wrap: break-word;
					word-break: break-word;
					font-size: 1em;
					color: rgba(#000, 0.8);

					&+.file a {
						border-radius: 0 0 $balloon-border-radius $balloon-border-radius;
					}
				}

				.file a {
					display: block;
					max-inline-size: 100%;
					border-radius: $balloon-border-radius;
					overflow: hidden;
					text-decoration: none;

					&:hover {
						text-decoration: none;

						p {
							background: #ccc;
						}
					}

					* {
						display: block;
						margin: 0;
						inline-size: 100%;
						max-block-size: 512px;
						object-fit: contain;
						box-sizing: border-box;
					}

					p {
						padding: 30px;
						text-align: center;
						color: #6e6a86;
						background: #ddd;
					}
				}
			}
		}

		footer {
			display: block;
			margin-block-start: 2px;
			margin-inline: 0;
			font-size: 0.65em;

			.read {
				margin: 0 8px;
			}

			i {
				margin-inline-start: 4px;
			}
		}
	}

	&:not(.isMe) {
		padding-inline-start: var(--margin);

		.content {
			padding-inline: 16px 32px;

			.balloon {
				$color: var(--X4);
				background: $color;

				&.noText {
					background: transparent;
				}

				&:not(.noText)::before {
					inset-inline-start: -14px;
					border-block-start: solid 8px transparent;
					border-inline-end: solid 8px $color;
					border-block-end: solid 8px transparent;
					border-inline-start: solid 8px transparent;
				}

				.content .text {
					color: var(--fg);
				}
			}

			footer {
				text-align: start;
			}
		}
	}

	&.isMe {
		flex-direction: row-reverse;
		padding-inline-end: var(--margin);
		inset-inline-end: var(--margin);

		.content {
			padding-inline: 32px 16px;
			text-align: end;

			.balloon {
				background: $me-balloon-color;
				text-align: start;

				::selection {
					color: var(--accent);
					background-color: #fff;
				}

				&.noText {
					background: transparent;
				}

				&:not(.noText)::before {
					inset-inline-end: -14px;
					inset-inline-start: auto;
					border-block-start: solid 8px transparent;
					border-inline-end: solid 8px transparent;
					border-block-end: solid 8px transparent;
					border-inline-start: solid 8px $me-balloon-color;
				}

				.content p.is-deleted {
					color: rgba(#fff, 0.5);
				}

				.content .text,
				.content .text ::v-deep(a),
				.content .text ::v-deep(span),
				.content .text ::v-deep(p),
				.content .text ::v-deep(blockquote) {
					color: var(--fgOnAccent) !important;
				}
			}

			footer {
				text-align: end;

				.read {
					user-select: none;
				}
			}
		}
	}

	&.max-width_400px {
		.avatar {
			inline-size: 48px;
			block-size: 48px;
		}

		.content .balloon .content .text {
			font-size: 0.9em;
		}
	}

	&.max-width_500px {
		.content .balloon .content .text {
			padding-block: 8px;
			padding-inline: 16px;
		}
	}
}
</style>