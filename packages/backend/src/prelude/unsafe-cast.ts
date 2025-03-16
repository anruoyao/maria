// unsafe type cast
export function unsafeCast<T>(val: unknown): T {
	return val as T;
}
