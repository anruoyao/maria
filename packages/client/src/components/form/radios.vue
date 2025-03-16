<script lang="ts">
import { type VNode, defineComponent, h } from "vue";
import MkRadio from "./radio.vue";

export default defineComponent({
	components: {
		MkRadio,
	},
	props: {
		modelValue: {
			required: false,
		},
	},
	data() {
		return {
			value: this.modelValue,
		};
	},
	watch: {
		value() {
			this.$emit("update:modelValue", this.value);
		},
	},
	render() {
		let options = this.$slots.default!();
		const label = this.$slots.label && this.$slots.label!();
		const caption = this.$slots.caption && this.$slots.caption!();

		// なぜかFragmentになることがあるため
		if (
			options.length === 1 &&
			options[0].props == null &&
			Array.isArray(options[0].children)
		)
			options = options[0].children as VNode[];

		return h(
			"fieldset",
			{
				class: "novjtcto",
			},
			[
				...(label
					? [
							h(
								"legend",
								{
									class: "label",
								},
								[label],
							),
						]
					: []),
				h(
					"div",
					{
						class: "body",
					},
					options.map((option) =>
						h(
							MkRadio,
							{
								// FIXME: It seems that there is a type error
								key: option.key,
								value: option.props?.value,
								disabled: option.props?.disabled,
								modelValue: this.value,
								"onUpdate:modelValue": (value) => {
									this.value = value;
									return value;
								},
							},
							option.children,
						),
					),
				),
				...(caption
					? [
							h(
								"div",
								{
									class: "caption",
								},
								[caption],
							),
						]
					: []),
			],
		);
	},
});
</script>

<style lang="scss" scoped>
.novjtcto {
	border: 0;
	padding: 0;
	> .label {
		font-size: 0.85em;
		padding-block-start: 0;
		padding-inline-end: 0;
		padding-block-end: 8px;
		padding-inline-start: 0;
		user-select: none;

		&:empty {
			display: none;
		}
	}

	> .body {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	> .caption {
		font-size: 0.85em;
		padding-block-start: 8px;
		padding-inline-end: 0;
		padding-block-end: 0;
		padding-inline-start: 0;
		color: var(--fgTransparentWeak);

		&:empty {
			display: none;
		}
	}
}
</style>
