import type { Endpoints } from "./api.types.js";

export type PropertyOfType<Type, U> = {
	[K in keyof Type]: Type[K] extends U ? K : never;
}[keyof Type];

export type EndpointsOf<T> = PropertyOfType<Endpoints, { res: T }>;

export type NonUndefinedAble<T> = T extends undefined ? never : T;
