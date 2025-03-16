import { ref as vueRef } from "vue";
import type { UnwrapRef } from "vue";

// TODO: 他のタブと永続化されたstateを同期

const PREFIX = "miux:";

interface Plugin {
	id: string;
	name: string;
	active: boolean;
	configData: Record<string, unknown>;
	token: string;
	ast: unknown[];
}

import darkTheme from "@/themes/d-rosepine.json5";
/**
 * Storage for configuration information that does not need to be constantly loaded into memory (non-reactive)
 */
import lightTheme from "@/themes/l-rosepinedawn.json5";

const ColdStoreDefault = {
	lightTheme,
	darkTheme,
	syncDeviceDarkMode: true,
	plugins: [] as Plugin[],
	mediaVolume: 0.5,
	vibrate: false,
	sound_masterVolume: 0.3,
	sound_note: { type: "none", volume: 0 },
	sound_noteMy: { type: "syuilo/up", volume: 1 },
	sound_notification: { type: "syuilo/pope2", volume: 1 },
	sound_chat: { type: "syuilo/pope1", volume: 1 },
	sound_chatBg: { type: "syuilo/waon", volume: 1 },
	sound_antenna: { type: "syuilo/triple", volume: 1 },
	sound_channel: { type: "syuilo/square-pico", volume: 1 },
};

const watchers: {
	key: string;
	callback: (value) => void;
}[] = [];

function get<T extends keyof typeof ColdStoreDefault>(
	key: T,
): (typeof ColdStoreDefault)[T] {
	// TODO: indexedDBにする
	//       ただしその際はnullチェックではなくキー存在チェックにしないとダメ
	//       (indexedDBはnullを保存できるため、ユーザーが意図してnullを格納した可能性がある)
	const value = localStorage.getItem(PREFIX + key);
	if (value == null) {
		return ColdStoreDefault[key];
	} else {
		return JSON.parse(value);
	}
}

function set<T extends keyof typeof ColdStoreDefault>(
	key: T,
	value: (typeof ColdStoreDefault)[T],
): void {
	// 呼び出し側のバグ等で undefined が来ることがある
	// undefined を文字列として localStorage に入れると参照する際の JSON.parse でコケて不具合の元になるため無視
	if (value === undefined) {
		console.error(`attempt to store undefined value for key '${key}'`);
		return;
	}

	localStorage.setItem(PREFIX + key, JSON.stringify(value));

	for (const watcher of watchers) {
		if (watcher.key === key) watcher.callback(value);
	}
}

function watch<T extends keyof typeof ColdStoreDefault>(
	key: T,
	callback: (value: (typeof ColdStoreDefault)[T]) => void,
) {
	watchers.push({ key, callback });
}

// TODO: VueのcustomRef使うと良い感じになるかも
function ref<T extends keyof typeof ColdStoreDefault>(key: T) {
	const v = get(key);
	const r = vueRef(v);
	// TODO: このままではwatcherがリークするので開放する方法を考える
	watch(key, (v) => {
		r.value = v as UnwrapRef<typeof v>;
	});
	return r;
}

/**
 * 特定のキーの、簡易的なgetter/setterを作ります
 * 主にvue場で設定コントロールのmodelとして使う用
 */
function makeGetterSetter<K extends keyof typeof ColdStoreDefault>(key: K) {
	// TODO: VueのcustomRef使うと良い感じになるかも
	const valueRef = ref(key);
	return {
		get: () => {
			return valueRef.value;
		},
		set: (value: (typeof ColdStoreDefault)[K]) => {
			const val = value;
			set(key, val);
		},
	};
}

export default {
	default: ColdStoreDefault,
	watchers,
	get,
	set,
	watch,
	ref,
	makeGetterSetter,
};
