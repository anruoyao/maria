<template>
	<MkLoading v-if="!err" />
	<XNotFound v-else />
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from "vue";
import * as os from "@/os";
import { useRouter } from "@/router";
import { userPage } from "@/filters/user";
import { notePage } from "@/filters/note";
const XNotFound = defineAsyncComponent(() => import("./not-found.vue"));

const err = ref(false);
const urlParams = new URLSearchParams(window.location.search);
const uri = urlParams.get("uri");
const router = useRouter();

onMounted(() => {
	os.api("ap/show", { uri })
		.then((res) => {
			switch (res.type) {
				case "User":
					router.push(userPage(res.object));
					break;
				case "Note":
					router.push(notePage(res.object));
					break;
				default:
					err.value = true;
					break;
			}
		})
		.catch((error) => {
			err.value = true;
		});
});
</script>
