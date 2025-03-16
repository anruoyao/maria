export interface BaseFormItem {
	hidden?: boolean;
	label?: string;
	description?: string;
	required?: boolean;
}

export type FormItemTextInput = BaseFormItem & {
	type: "string";
	default?: string | null;
	multiline?: false;
};
export type FormItemTextarea = BaseFormItem & {
	type: "string";
	default?: string | null;
	multiline: true;
};

export type FormItemText = FormItemTextInput | FormItemTextarea;

export type FormItemNumber = BaseFormItem & {
	type: "number";
	default?: number | null;
	step?: number | null;
};
export type FormItemEmail = BaseFormItem & {
	type: "email";
	default?: string | null;
};
export type FormItemPassword = BaseFormItem & {
	type: "password";
	default?: never;
	__result_typedef?: string;
};
export type FormItemUrl = BaseFormItem & {
	type: "url";
	default?: string | null;
};
export type FormItemDate = BaseFormItem & {
	type: "date";
	default?: string | Date | null;
};
export type FormItemTime = BaseFormItem & {
	type: "time";
	default?: string | Date | null;
};
export type FormItemSearch = BaseFormItem & {
	type: "search";
	default?: string | null;
};
export type FormItemSwitch = BaseFormItem & {
	type: "boolean";
	default?: boolean | null;
};
export type FormItemSelect = BaseFormItem & {
	type: "enum";
	default?: string | number | symbol | null;
	enum: {
		value: string | number | symbol;
		label: string;
	}[];
};
export type FormItemRadios = BaseFormItem & {
	type: "radio";
	default?: string | number | symbol | null;
	options: {
		label: string;
		value: string | number | symbol;
	}[];
};
export type FormItemRange = BaseFormItem & {
	type: "range";
	default?: number | null;
	min: number;
	max: number;
	step?: number;
	textConverter?: (value: number) => string;
};
export type FormItemButton = BaseFormItem & {
	type: "button";
	content?: string;
	action: (event, values) => unknown;
	default?: never;
};
export type FormItemObject = BaseFormItem & {
	type: "object";
	default: Record<string, unknown> | null;
	hidden: true;
};

export type FormItemInputArray = [
	FormItemTextInput,
	FormItemNumber,
	FormItemEmail,
	FormItemPassword,
	FormItemUrl,
	FormItemDate,
	FormItemTime,
	FormItemSearch,
];

export type FormItemTypeArray = [
	...FormItemInputArray,
	FormItemTextarea,
	FormItemSwitch,
	FormItemSelect,
	FormItemButton,
	FormItemRadios,
	FormItemRange,
	FormItemObject,
];

export type FormItemInput = FormItemInputArray[number];

export type FormItemType = FormItemTypeArray[number];

export type Form = Record<string, FormItemType>;

export type GetFormItemByType<
	T extends FormItemType["type"],
	F extends FormItemType = FormItemType,
> = F extends { type: T } ? F : never;

type NonUndefindAble<T> = T extends undefined ? never : T;
type NonNullAble<T> = T extends null ? never : T;

export type GetFormItemResultType<
	T extends FormItemType["type"],
	I extends FormItemType = GetFormItemByType<T>,
> = NonUndefindAble<
	"__result_typedef" extends keyof I ? I["__result_typedef"] : I["default"]
>;

export type GetFormResultType<F extends Form> = {
	[K in keyof F]: F[K]["required"] extends false
		? GetFormItemResultType<F[K]["type"]>
		: NonNullAble<GetFormItemResultType<F[K]["type"]>>;
};
