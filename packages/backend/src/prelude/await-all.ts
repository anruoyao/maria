import { unsafeCast } from "./unsafe-cast.js";

export type Promiseable<T> = {
	[K in keyof T]: Promise<T[K]> | T[K];
};

type RecursiveResolvePromise<U> = U extends Date
	? U
	: U extends Array<infer V>
		? Array<ResolvedPromise<V>>
		: U extends object
			? { [key in keyof U]: ResolvedPromise<U[key]> }
			: U;

type ResolvedPromise<T> = T extends Promise<infer U>
	? RecursiveResolvePromise<U>
	: RecursiveResolvePromise<T>;

export type OuterPromise<T> = Promise<{
	[K in keyof T]: ResolvedPromise<T[K]>;
}>;

/**
 * Resolve all promises in the object recursively,
 * and return a promise that resolves to the object with all promises resolved.
 */
export async function awaitAll<T>(obj: Promiseable<T>): OuterPromise<T> {
	const target = {} as T;
	const keys = unsafeCast<(keyof T)[]>(Object.keys(obj));
	const values = Object.values(obj) as any[];

	const resolvedValues = await Promise.all(
		values.map((value) =>
			!value?.constructor || value.constructor.name !== "Object"
				? value
				: awaitAll(value),
		),
	);

	for (let i = 0; i < keys.length; i++) {
		target[keys[i]] = resolvedValues[i];
	}

	return target as OuterPromise<T>;
}
