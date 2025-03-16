<template>
	<div class="cpjygsrt" :class="{ error: error != null, warn: warn != null }">
		<header>
			<div class="buttons">
				<button v-if="removable" class="_button" @click="remove()">
					<i :class="icon('ph-trash')"></i>
				</button>
			</div>
			<div class="title"><slot name="header"></slot></div>
			<div class="buttons">
				<slot name="func"></slot>
				<div v-if="draggable" class="drag-handle _button">
					<i :class="icon('ph-list')"></i>
				</div>
				<button class="_button" @click="toggleContent(!showBody)">
					<template v-if="showBody"
						><i :class="icon('ph-caret-up ph-dir')"></i
					></template>
					<template v-else
						><i :class="icon('ph-caret-down ph-dir')"></i
					></template>
				</button>
			</div>
		</header>
		<p v-show="showBody" v-if="error != null" class="error">
			{{
				i18n.t("_pages.script.typeError", {
					slot: error.arg + 1,
					expect: i18n.t(`script.types.${error.expect}`),
					actual: i18n.t(`script.types.${error.actual}`),
				})
			}}
		</p>
		<p v-show="showBody" v-if="warn != null" class="warn">
			{{
				i18n.t("_pages.script.thereIsEmptySlot", {
					slot: warn.slot + 1,
				})
			}}
		</p>
		<div v-show="showBody" class="body">
			<slot></slot>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

export default defineComponent({
	props: {
		expanded: {
			type: Boolean,
			default: true,
		},
		removable: {
			type: Boolean,
			default: true,
		},
		draggable: {
			type: Boolean,
			default: false,
		},
		error: {
			required: false,
			default: null,
		},
		warn: {
			required: false,
			default: null,
		},
	},
	emits: ["toggle", "remove"],
	data() {
		return {
			showBody: this.expanded,
			i18n,
			icon,
		};
	},
	methods: {
		toggleContent(show: boolean) {
			this.showBody = show;
			this.$emit("toggle", show);
		},
		remove() {
			this.$emit("remove");
		},
	},
});
</script>

<style lang="scss" scoped>
.cpjygsrt {
	position: relative;
	overflow: hidden;
	background: var(--panel);
	border: solid 2px var(--X12);
	border-radius: 6px;

	&:hover {
		border: solid 2px var(--X13);
	}

	&.warn {
		border: solid 2px #f6c177;
	}

	&.error {
		border: solid 2px #eb6f92;
	}

	& + .cpjygsrt {
		margin-block-start: 16px;
	}

	> header {
		display: flex;
		padding-block-start: 0.5em;

		> .title {
			z-index: 1;
			margin: 0;
			font-size: 0.9em;
			font-weight: bold;
			box-shadow: 0 1px rgba(#000, 0.07);
			flex: 1;

			> i {
				margin-inline-end: 6px;
			}

			&:empty {
				display: none;
			}
		}

		> .buttons {
			z-index: 2;

			> ._button,
			> :slotted(._button) {
				padding: 0;
				inline-size: 42px;
				font-size: 0.9em;
				text-align: center;
			}

			.drag-handle {
				cursor: move;
			}
		}
	}

	> .warn {
		color: #ea9d34;
		margin: 0;
		padding-block-start: 16px;
		padding-inline-end: 16px;
		padding-block-end: 0;
		padding-inline-start: 16px;
		font-size: 14px;
	}

	> .error {
		color: #b4637a;
		margin: 0;
		padding-block-start: 16px;
		padding-inline-end: 16px;
		padding-block-end: 0;
		padding-inline-start: 16px;
		font-size: 14px;
	}

	> .body {
		::v-deep(.juejbjww),
		::v-deep(.eiipwacr) {
			&:not(.inline):first-child {
				margin-block-start: 28px;
			}

			&:not(.inline):last-child {
				margin-block-end: 20px;
			}
		}
	}
}
</style>
