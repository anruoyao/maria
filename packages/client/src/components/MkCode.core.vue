<template>
	<code v-if="inline" :class="`language-${prismLang}`" v-html="html"></code>
	<pre
		v-else
		:class="`language-${prismLang}`"
	><code :class="`language-${prismLang}`" v-html="html"></code></pre>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import Prism, { loadLanguage } from "@/scripts/prism";
import "prismjs/themes/prism-okaidia.css";

const props = defineProps<{
	code: string;
	lang?: string;
	inline?: boolean;
}>();

// fallback to "plaintext" if language not loaded
const prismLang = ref(
	props.lang != null && props.lang in Prism.languages
		? props.lang
		: "plaintext",
);

// try to load language asynchronously
if (props.lang != null && !(props.lang in Prism.languages)) {
	const { lang } = props;
	loadLanguage(props.lang).then(
		// onLoaded
		// biome-ignore lint/suspicious/noAssignInExpressions: assign intentionally
		() => (prismLang.value = lang),
		// onError
		() => {},
	);
}

const html = computed(() =>
	Prism.highlight(
		props.code,
		Prism.languages[prismLang.value],
		prismLang.value,
	),
);
</script>
