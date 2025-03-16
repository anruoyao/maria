// TODO: replace this file with @/types/form.ts

import type { FormItemType, GetFormItemResultType } from "@/types/form";

export type FormItem = FormItemType;

export type Form = Record<string, FormItem>;

export type GetFormResultType<F extends Form> = {
	[P in keyof F]: NonNullable<GetFormItemResultType<F[P]["type"]>>;
};
