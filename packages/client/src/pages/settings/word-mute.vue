<template>
	<div class="_formRoot">
		<MkTab v-model="tab" class="_formBlock">
			<option value="soft">{{ i18n.ts._wordMute.soft }}</option>
			<option value="hard">{{ i18n.ts._wordMute.hard }}</option>
		</MkTab>
		<div class="_formBlock">
			<div v-show="tab === 'soft'">
				<MkInfo class="_formBlock">{{
					i18n.ts._wordMute.softDescription
				}}</MkInfo>
				<FormTextarea v-model="softMutedWords" class="_formBlock">
					<span>{{ i18n.ts._wordMute.muteWords }}</span>
					<template #caption
						>{{ i18n.ts._wordMute.muteWordsDescription }}<br />{{
							i18n.ts._wordMute.muteWordsDescription2
						}}</template
					>
				</FormTextarea>
				<MkInfo class="_formBlock">{{
					i18n.ts._wordMute.langDescription
				}}</MkInfo>
				<FormTextarea v-model="softMutedLangs" class="_formBlock">
					<span>{{ i18n.ts._wordMute.muteLangs }}</span>
					<template #caption
						>{{ i18n.ts._wordMute.muteLangsDescription }}<br />{{
							i18n.ts._wordMute.muteLangsDescription2
						}}</template
					>
				</FormTextarea>
			</div>
			<div v-show="tab === 'hard'">
				<MkInfo class="_formBlock"
					>{{ i18n.ts._wordMute.hardDescription }}
					{{ i18n.ts.reflectMayTakeTime }}</MkInfo
				>
				<FormTextarea v-model="hardMutedWords" class="_formBlock">
					<span>{{ i18n.ts._wordMute.muteWords }}</span>
					<template #caption>{{
						i18n.ts._wordMute.muteWordsDescription
					}}</template>
				</FormTextarea>
				<FormTextarea v-model="hardMutedPatterns" class="_formBlock">
					<span>{{ i18n.ts._wordMute.mutePatterns }}</span>
					<template #caption>{{
						i18n.ts._wordMute.muteWordsDescription2
					}}</template>
				</FormTextarea>
				<MkKeyValue
					v-if="hardWordMutedNotesCount != null"
					class="_formBlock"
				>
					<template #key>{{ i18n.ts._wordMute.mutedNotes }}</template>
					<template #value>{{
						number(hardWordMutedNotesCount)
					}}</template>
				</MkKeyValue>
			</div>
		</div>
		<MkButton primary inline :disabled="!changed" @click="save()"
			><i :class="icon('ph-floppy-disk-back')"></i>
			{{ i18n.ts.save }}</MkButton
		>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import FormTextarea from "@/components/form/textarea.vue";
import MkKeyValue from "@/components/MkKeyValue.vue";
import MkButton from "@/components/MkButton.vue";
import MkInfo from "@/components/MkInfo.vue";
import MkTab from "@/components/MkTab.vue";
import * as os from "@/os";
import number from "@/filters/number";
import { defaultStore } from "@/store";
import { me } from "@/me";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const render = (mutedWords) =>
	mutedWords
		.map((x) => {
			if (Array.isArray(x)) {
				return x.join(" ");
			} else {
				return x;
			}
		})
		.join("\n");

const tab = ref("soft");
const softMutedWords = ref(render(defaultStore.state.mutedWords));
const softMutedLangs = ref(render(defaultStore.state.mutedLangs));
const hardMutedWords = ref(render(me!.mutedWords));
const hardMutedPatterns = ref(me!.mutedPatterns.join("\n"));
const hardWordMutedNotesCount = ref(null);
const changed = ref(false);

os.api("i/get-word-muted-notes-count", {}).then((response) => {
	hardWordMutedNotesCount.value = response?.count;
});

watch(softMutedWords, () => {
	changed.value = true;
});

watch(softMutedLangs, () => {
	changed.value = true;
});

watch(hardMutedWords, () => {
	changed.value = true;
});

watch(hardMutedPatterns, () => {
	changed.value = true;
});

async function save() {
	const parseSoftMutes = (mutes, tab) => {
		// split into lines, remove empty lines and unnecessary whitespace
		const lines = mutes
			.trim()
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line !== "");

		// check each line if it is a RegExp or not
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const regexp = line.match(/^\/(.+)\/(.*)$/);
			if (regexp) {
				// check that the RegExp is valid
				try {
					new RegExp(regexp[1], regexp[2]);
					// note that regex lines will not be split by spaces!
				} catch (err: any) {
					// invalid syntax: do not save, do not reset changed flag
					os.alert({
						type: "error",
						title: i18n.ts.regexpError,
						text:
							i18n.t("regexpErrorDescription", {
								tab,
								line: i + 1,
							}) +
							"\n" +
							err.toString(),
					});
					// re-throw error so these invalid settings are not saved
					throw err;
				}
			} else {
				lines[i] = line.split(" ");
			}
		}

		return lines;
	};

	const parseMutedWords = (mutes) => {
		// split into lines, remove empty lines and unnecessary whitespace
		return mutes
			.trim()
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line !== "")
			.map((line) => line.split(" "))
			.filter((line) => line.length > 0);
	};

	const parseMutedPatterns = (mutes, tab) => {
		// split into lines, remove empty lines and unnecessary whitespace
		const lines = mutes
			.trim()
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line !== "");

		// check each line if it is a RegExp or not
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const regexp = line.match(/^\/(.+)\/(.*)$/);
			if (regexp) {
				// check that the RegExp is valid
				try {
					new RegExp(regexp[1], regexp[2]);
					// note that regex lines will not be split by spaces!
				} catch (err: any) {
					// invalid syntax: do not save, do not reset changed flag
					os.alert({
						type: "error",
						title: i18n.ts.regexpError,
						text:
							i18n.t("regexpErrorDescription", {
								tab,
								line: i + 1,
							}) +
							"\n" +
							err.toString(),
					});
					// re-throw error so these invalid settings are not saved
					throw err;
				}
			} else {
				// invalid syntax: do not save, do not reset changed flag
				os.alert({
					type: "error",
					title: i18n.ts.regexpError,
					text: i18n.t("regexpErrorDescription", {
						tab,
						line: i + 1,
					}),
				});
				// re-throw error so these invalid settings are not saved
				throw new Error("Invalid regular expression");
			}
		}

		return lines;
	};

	let softMutes;
	let softMLangs;
	let hardMWords;
	let hardMPatterns;
	try {
		softMutes = parseSoftMutes(softMutedWords.value, i18n.ts._wordMute.soft);
		softMLangs = parseMutedWords(softMutedLangs.value);
		hardMWords = parseMutedWords(hardMutedWords.value);
		hardMPatterns = parseMutedPatterns(
			hardMutedPatterns.value,
			i18n.ts._wordMute.hard,
		);
	} catch (err) {
		// already displayed error message in parseMutes
		return;
	}

	defaultStore.set("mutedWords", softMutes);
	defaultStore.set("mutedLangs", softMLangs);
	await os.api("i/update", {
		mutedWords: hardMWords,
		mutedPatterns: hardMPatterns,
	});

	changed.value = false;
}

definePageMetadata({
	title: i18n.ts.wordMute,
	icon: `${icon("ph-speaker-x ph-dir")}`,
});
</script>
