<template>
	<XModalWindow
		ref="dialog"
		:width="450"
		:can-close="false"
		:with-ok-button="true"
		:ok-button-disabled="false"
		@click="cancel()"
		@ok="ok()"
		@close="cancel()"
		@closed="emit('closed')"
	>
		<template #header>
			{{ title }}
		</template>

		<MkSpacer :margin-min="20" :margin-max="32">
			<div class="_formRoot">
				<template
					v-for="[formItem, formItemName] in unHiddenForms()"
				>
					<FormInput
						v-if="formItem.type === 'number'"
						v-model="values[formItemName]"
						type="number"
						:step="formItem.step || 1"
						class="_formBlock"
					>
						<template #label
							><span v-text="formItem.label || formItemName"></span
							><span v-if="formItem.required === false">
								({{ i18n.ts.optional }})</span
							></template
						>
						<template v-if="formItem.description" #caption>{{
							formItem.description
						}}</template>
					</FormInput>
					<FormInput
						v-else-if="
							formItem.type === 'string' &&
							!formItem.multiline
						"
						v-model="values[formItemName]"
						type="text"
						class="_formBlock"
					>
						<template #label
							><span v-text="formItem.label || formItemName"></span
							><span v-if="formItem.required === false">
								({{ i18n.ts.optional }})</span
							></template
						>
						<template v-if="formItem.description" #caption>{{
							formItem.description
						}}</template>
					</FormInput>
					<FormInput
						v-else-if="
							formItem.type === 'email' ||
							formItem.type === 'password' ||
							formItem.type === 'url' ||
							formItem.type === 'date' ||
							formItem.type === 'time' ||
							formItem.type === 'search'
						"
						v-model="values[formItemName]"
						:type="formItem.type"
						class="_formBlock"
					>
						<template #label
							><span v-text="formItem.label || formItemName"></span
							><span v-if="formItem.required === false">
								({{ i18n.ts.optional }})</span
							></template
						>
						<template v-if="formItem.description" #caption>{{
							formItem.description
						}}</template>
					</FormInput>
					<FormTextarea
						v-else-if="
							formItem.type === 'string' && formItem.multiline
						"
						v-model="values[formItemName]"
						class="_formBlock"
					>
						<template #label
							><span v-text="formItem.label || formItemName"></span
							><span v-if="formItem.required === false">
								({{ i18n.ts.optional }})</span
							></template
						>
						<template v-if="formItem.description" #caption>{{
							formItem.description
						}}</template>
					</FormTextarea>
					<FormSwitch
						v-else-if="formItem.type === 'boolean'"
						v-model="values[formItemName]"
						class="_formBlock"
					>
						<span v-text="formItem.label || formItemName"></span>
						<template v-if="formItem.description" #caption>{{
							formItem.description
						}}</template>
					</FormSwitch>
					<FormSelect
						v-else-if="formItem.type === 'enum'"
						v-model="values[formItemName]"
						class="_formBlock"
					>
						<template #label>
						<span v-text="formItem.label || formItemName"></span>
						<span v-if="formItem.required === false">
								({{ i18n.ts.optional }})</span
						>
						</template>
						<option
							v-for="item in formItem.enum"
							:key="item.value"
							:value="item.value"
						>
							{{ item.label }}
						</option>
					</FormSelect>
					<FormRadios
						v-else-if="formItem.type === 'radio'"
						v-model="values[formItemName]"
						class="_formBlock"
					>
						<template #label
							><span v-text="formItem.label || formItemName"></span
							><span v-if="formItem.required === false">
								({{ i18n.ts.optional }})</span
							></template
						>
						<option
							v-for="item in formItem.options"
							:key="item.value"
							:value="item.value"
						>
							{{ item.label }}
						</option>
					</FormRadios>
					<FormRange
						v-else-if="formItem.type === 'range'"
						v-model="values[formItemName]"
						:min="formItem.min"
						:max="formItem.max"
						:step="formItem.step"
						:text-converter="formItem.textConverter"
						class="_formBlock"
					>
						<template #label
							><span v-text="formItem.label || formItemName"></span
							><span v-if="formItem.required === false">
								({{ i18n.ts.optional }})</span
							></template
						>
						<template v-if="formItem.description" #caption>{{
							formItem.description
						}}</template>
					</FormRange>
					<MkButton
						v-else-if="formItem.type === 'button'"
						class="_formBlock"
						@click="formItem.action($event, values)"
					>
						<span v-text="formItem.content || formItemName"></span>
					</MkButton>
				</template>
			</div>
		</MkSpacer>
	</XModalWindow>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import FormInput from "./form/input.vue";
import FormTextarea from "./form/textarea.vue";
import FormSwitch from "./form/switch.vue";
import FormSelect from "./form/select.vue";
import FormRange from "./form/range.vue";
import MkButton from "./MkButton.vue";
import FormRadios from "./form/radios.vue";
import XModalWindow from "@/components/MkModalWindow.vue";
import { i18n } from "@/i18n";
import type { FormItemType } from "@/types/form";

const props = defineProps<{
	title: string;
	form: Record<string, FormItemType>;
}>();

// biome-ignore lint/suspicious/noExplicitAny: To prevent overly complex types we have to use any here
type ValueType = Record<string, any>;

const emit = defineEmits<{
	done: [
		status: {
			result?: Record<string, FormItemType["default"]>;
			canceled?: true;
		},
	];
	closed: [];
}>();

const values = ref<ValueType>({});
const dialog = ref<InstanceType<typeof XModalWindow> | null>(null);

for (const item in props.form) {
	values.value[item] = props.form[item].default ?? null;
}

function unHiddenForms(): [FormItemType, string][] {
	return Object.keys(props.form)
		.filter((itemName) => !props.form[itemName].hidden)
		.map((itemName) => [props.form[itemName], itemName]);
}

function ok() {
	emit("done", {
		result: values.value,
	});
	dialog.value!.close();
}

function cancel() {
	emit("done", {
		canceled: true,
	});
	dialog.value!.close();
}
</script>
