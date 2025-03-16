import type { TypeUtils } from "firefish-js";

export type BasePageContent = {
	name: string;
};

export type PageContentTextInput = BasePageContent & {
	type: "textInput";
	default: string;
};

export type PageContentTextareaInput = BasePageContent & {
	type: "textareaInput";
	default?: string;
};

export type PageContentNumberInput = BasePageContent & {
	type: "numberInput";
	default?: number;
};

export type PageContentSwitch = BasePageContent & {
	type: "switch";
	default?: boolean;
};
export type PageContentCounter = BasePageContent & {
	type: "counter";
	default?: number;
};

export type PageContentRadioButton = BasePageContent & {
	type: "radioButton";
	default?: string;
};

export type PageContentChildren =
	| PageContentTextInput
	| PageContentTextareaInput
	| PageContentNumberInput
	| PageContentSwitch
	| PageContentCounter
	| PageContentRadioButton;

export type PageContentParent = {
	type: "parent";
	children: PageContentChildren[];
};

export type PageContent = PageContentParent | PageContentChildren;

export type GetPageVar<T extends PageContentChildren> = {
	name: string;
	type: TypeUtils.NonUndefinedAble<T["default"]> extends string
		? "string"
		: TypeUtils.NonUndefinedAble<T["default"]> extends boolean
			? "boolean"
			: TypeUtils.NonUndefinedAble<T["default"]> extends number
				? "number"
				: never;
	value: TypeUtils.NonUndefinedAble<T["default"]>;
};

export type PageVar =
	| {
			name: string;
			type: "string";
			value: string;
	  }
	| {
			name: string;
			type: "boolean";
			value: boolean;
	  }
	| {
			name: string;
			type: "number";
			value: number;
	  };
