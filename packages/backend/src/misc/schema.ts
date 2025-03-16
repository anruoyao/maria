// TODO: use firefish-js
import { Schema as _Schema } from "firefish-js";

export const refs = _Schema.refs;
export type Packed<T extends keyof typeof refs> = _Schema.Packed<T>;
export type Schema = _Schema.Schema;
export type SchemaType<P extends _Schema.Schema> = _Schema.SchemaType<P>;
