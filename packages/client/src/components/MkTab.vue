<script lang="ts">
import { defineComponent, h, resolveDirective, withDirectives } from "vue";

export default defineComponent({
	props: {
		modelValue: {
			required: true,
		},
		style: {
			required: false,
		},
	},
	render() {
		const options = this.$slots.default();

		return h(
			"div",
			{
				class: [
					"pxhvhrfw",
					{ chips: this.style === "chips" },
					{ underline: this.style === "underline" },
				],
				role: "tablist",
			},
			options.map((option) =>
				withDirectives(
					h(
						"button",
						{
							class: "_button",
							role: "tab",
							key: option.key,
							"aria-selected":
								this.modelValue === option.props?.value ? "true" : "false",
							onClick: () => {
								this.$emit("update:modelValue", option.props?.value);
							},
						},
						option.children,
					),
					[[resolveDirective("click-anime")]],
				),
			),
		);
	},
});
</script>

<style lang="scss">
.pxhvhrfw {
	display: flex;
	font-size: 90%;
	border-radius: var(--radius);
	padding-block: 10px;
	padding-inline: 8px;

	> button {
		flex: 1;
		padding-block: 10px;
		padding-inline: 8px;
		margin-block: 0;
		margin-inline: 8px;
		border-radius: var(--radius);

		&:disabled {
			opacity: 1 !important;
			cursor: default;
		}

		&[aria-selected="true"] {
			color: var(--accent);
			background: var(--accentedBg) !important;
		}

		&:not([aria-selected="true"]):hover {
			color: var(--fgHighlighted);
			background: var(--panelHighlight);
		}

		&:not(:first-child) {
			margin-inline-start: 8px;
		}

		> .icon {
			margin-inline-end: 6px;
		}

		&:empty {
			display: none !important;
		}
	}

	&.chips,
	&.underline {
		padding-block: 12px;
		padding-inline: 32px;
		font-size: 0.85em;
		overflow-x: auto;
		overflow-inline: auto;
		mask: linear-gradient(var(--gradient-to-inline-end) black calc(100% - 90px), transparent),;
		-webkit-mask: linear-gradient(
			var(--gradient-to-inline-end),
			black calc(100% - 90px),
			transparent
		);
		padding-inline-end: 90px !important;
		white-space: nowrap;
		
		@supports not (overflow-inline: auto) {
			.vertical-lr &, .vertical-rl & {
				overflow-x: visible;
				overflow-y: auto;
			}
		}

		&::-webkit-scrollbar {
			display: none;
		}
		> button {
			display: flex;
			gap: 6px;
			align-items: center;
			flex: unset;
			margin: 0;
			margin-inline-end: 8px;
			padding-block: 0.5em;
			padding-inline: 1em;
			border-radius: 100px;
			background: var(--buttonBg);
			> i {
				margin-block-start: -0.1em;
			}
			> .count {
				margin-inline-end: -0.2em;
			}
		}
	}

	&.underline {
		padding-block: 0 !important;
		margin-block-end: -1px;
		border-radius: 0;
		button {
			background: none !important;
			border-radius: 0 !important;
			padding-block: 10px !important;
			border-block-end: 2px solid transparent;
			&[aria-selected="true"] {
				background: none !important;
				font-weight: 700;
				border-block-end-color: var(--accent);
			}
		}
	}

	&.max-width_500px {
		font-size: 80%;

		> button {
			padding-block: 11px;
			padding-inline: 8px;
		}
	}
}
</style>
