import { ColdDeviceStorage } from "@/store";

let ctx: AudioContext | null;
try {
	ctx = new AudioContext();
} catch {
	ctx = null;
}

const cache = new Map<string, AudioBuffer>();

export async function getAudio(
	file: string,
	useCache = true,
): Promise<AudioBuffer | null> {
	if (useCache && cache.has(file)) {
		return cache.get(file) ?? null;
	}
	if (ctx == null) {
		return null;
	}

	const response = await fetch(`/static-assets/sounds/${file}.mp3`);
	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

	if (useCache) {
		cache.set(file, audioBuffer);
	}

	return audioBuffer;
}

export function setVolume(
	audio: HTMLAudioElement,
	volume: number,
): HTMLAudioElement {
	const masterVolume = ColdDeviceStorage.get("sound_masterVolume");
	audio.volume = masterVolume - (1 - volume) * masterVolume;
	return audio;
}

export function play(type: string) {
	const sound = ColdDeviceStorage.get(`sound_${type}` as any);
	if (sound.type == null) return;
	playFile(sound.type, sound.volume);
}

export async function playFile(file: string, volume: number) {
	const masterVolume = ColdDeviceStorage.get("sound_masterVolume");
	if (ctx == null || masterVolume === 0 || volume === 0) {
		return;
	}

	const gainNode = ctx.createGain();
	gainNode.gain.value = masterVolume * volume;

	const soundSource = ctx.createBufferSource();
	soundSource.buffer = await getAudio(file);
	soundSource.connect(gainNode).connect(ctx.destination);
	soundSource.start();
}
