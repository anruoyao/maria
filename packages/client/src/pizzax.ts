// PIZZAX --- A lightweight store

import type { Ref } from "vue";
import { onUnmounted, ref, watch } from "vue";
import { api } from "./os";
import { useStream } from "./stream";
import { isSignedIn, me } from "@/me";
import type { TypeUtils } from "firefish-js";

type StateDef = Record<
	string,
	{
		where: "account" | "device" | "deviceAccount";
		default: unknown;
	}
>;

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

const stream = useStream();
const connection = isSignedIn(me) ? stream.useChannel("main") : null;

export class Storage<T extends StateDef> {
	public readonly key: string;
	public readonly keyForLocalStorage: string;

	public readonly def: T;

	// TODO: これが実装されたらreadonlyにしたい: https://github.com/microsoft/TypeScript/issues/37487
	public readonly state: {
		[K in keyof T]: T[K]["default"];
	};

	public readonly reactiveState: {
		[K in keyof T]: Ref<T[K]["default"]>;
	};

	constructor(key: string, def: T) {
		this.key = key;
		this.keyForLocalStorage = `pizzax::${key}`;
		this.def = def;

		// TODO: indexedDBにする
		const deviceState = JSON.parse(
			localStorage.getItem(this.keyForLocalStorage) || "{}",
		);
		const deviceAccountState = isSignedIn(me)
			? JSON.parse(
					localStorage.getItem(`${this.keyForLocalStorage}::${me.id}`) || "{}",
				)
			: {};
		const registryCache = isSignedIn(me)
			? JSON.parse(
					localStorage.getItem(`${this.keyForLocalStorage}::cache::${me.id}`) ||
						"{}",
				)
			: {};

		const state = {};
		const reactiveState = {};
		for (const [k, v] of Object.entries(def)) {
			if (
				v.where === "device" &&
				Object.prototype.hasOwnProperty.call(deviceState, k)
			) {
				state[k] = deviceState[k];
			} else if (
				v.where === "account" &&
				isSignedIn(me) &&
				Object.prototype.hasOwnProperty.call(registryCache, k)
			) {
				state[k] = registryCache[k];
			} else if (
				v.where === "deviceAccount" &&
				Object.prototype.hasOwnProperty.call(deviceAccountState, k)
			) {
				state[k] = deviceAccountState[k];
			} else {
				state[k] = v.default;
				if (_DEV_) console.log("Use default value", k, v.default);
			}
		}
		for (const [k, v] of Object.entries(state)) {
			reactiveState[k] = ref(v);
		}
		this.state = state as typeof this.state;
		this.reactiveState = reactiveState as typeof this.reactiveState;

		if (isSignedIn(me)) {
			// なぜかsetTimeoutしないとapi関数内でエラーになる(おそらく循環参照してることに原因がありそう)
			// For some reason, if I don't setTimeout, an error occurs in the api function (probably caused by circular references)
			window.setTimeout(() => {
				api("i/registry/get-all", { scope: ["client", this.key] }).then(
					(kvs) => {
						const cache = {};
						for (const [k, v] of Object.entries(def)) {
							if (v.where === "account") {
								if (Object.prototype.hasOwnProperty.call(kvs, k)) {
									state[k] = kvs[k];
									reactiveState[k].value = kvs[k];
									cache[k] = kvs[k];
								} else {
									state[k] = v.default;
									reactiveState[k].value = v.default;
								}
							}
						}
						localStorage.setItem(
							`${this.keyForLocalStorage}::cache::${me!.id}`,
							JSON.stringify(cache),
						);
					},
				);
			}, 1);
			// streamingのuser storage updateイベントを監視して更新
			connection?.on(
				"registryUpdated",
				({
					scope,
					key,
					value,
				}: {
					scope?: string[];
					key: keyof T;
					value: T[typeof key]["default"];
				}) => {
					if (
						scope == null ||
						scope.length !== 2 ||
						scope[0] !== "client" ||
						scope[1] !== this.key ||
						this.state[key] === value
					)
						return;

					this.state[key] = value;
					this.reactiveState[key].value = value;

					const cache = JSON.parse(
						localStorage.getItem(
							`${this.keyForLocalStorage}::cache::${me!.id}`,
						) || "{}",
					);
					if (cache[key] !== value) {
						cache[key] = value;
						localStorage.setItem(
							`${this.keyForLocalStorage}::cache::${me!.id}`,
							JSON.stringify(cache),
						);
					}
				},
			);
		}
	}

	public set<K extends keyof T>(key: K & string, value: T[K]["default"]): void {
		if (_DEV_) console.log("set", key, value);

		this.state[key] = value;
		this.reactiveState[key].value = value;

		switch (this.def[key].where) {
			case "device": {
				const deviceState = JSON.parse(
					localStorage.getItem(this.keyForLocalStorage) || "{}",
				);
				deviceState[key] = value;
				localStorage.setItem(
					this.keyForLocalStorage,
					JSON.stringify(deviceState),
				);
				break;
			}
			case "deviceAccount": {
				if (!isSignedIn(me)) break;
				const deviceAccountState = JSON.parse(
					localStorage.getItem(`${this.keyForLocalStorage}::${me.id}`) || "{}",
				);
				deviceAccountState[key] = value;
				localStorage.setItem(
					`${this.keyForLocalStorage}::${me.id}`,
					JSON.stringify(deviceAccountState),
				);
				break;
			}
			case "account": {
				if (!isSignedIn(me)) break;
				const cache = JSON.parse(
					localStorage.getItem(`${this.keyForLocalStorage}::cache::${me.id}`) ||
						"{}",
				);
				cache[key] = value;
				localStorage.setItem(
					`${this.keyForLocalStorage}::cache::${me.id}`,
					JSON.stringify(cache),
				);
				api("i/registry/set", {
					scope: ["client", this.key],
					key,
					value,
				});
				break;
			}
		}
	}

	public push<K extends TypeUtils.PropertyOfType<T, { default: unknown[] }>>(
		key: K & string,
		value: ArrayElement<T[K]["default"]>,
	): void {
		const currentState = this.state[key] as unknown[];
		this.set(key, [...currentState, value]);
	}

	public reset(key: keyof T & string) {
		this.set(key, this.def[key].default);
	}

	/**
	 * 特定のキーの、簡易的なgetter/setterを作ります
	 * 主にvue場で設定コントロールのmodelとして使う用
	 */
	public makeGetterSetter<K extends keyof T>(
		key: K & string,
		getter?: (oldV: T[K]["default"]) => T[K]["default"],
		setter?: (oldV: T[K]["default"]) => T[K]["default"],
	) {
		const valueRef = ref(this.state[key]) as Ref<T[K]["default"]>;

		const stop = watch(this.reactiveState[key], (val) => {
			valueRef.value = val;
		});

		// NOTE: vueコンポーネント内で呼ばれない限りは、onUnmounted は無意味なのでメモリリークする
		onUnmounted(() => {
			stop();
		});

		// TODO: VueのcustomRef使うと良い感じになるかも
		return {
			get: () => {
				if (getter) {
					return getter(valueRef.value);
				} else {
					return valueRef.value;
				}
			},
			set: (value: T[K]["default"]) => {
				const val = setter ? setter(value) : value;
				this.set(key, val);
				valueRef.value = val;
			},
		};
	}
}
