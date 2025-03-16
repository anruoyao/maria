<template>
	<div class="mk-follow-page"></div>
</template>

<script lang="ts" setup>
import { acct } from "firefish-js";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { host as hostRaw } from "@/config";
import { isSignedIn, me } from "@/me";
import { waiting } from "@/os";

const acctUri = new URL(location.href).searchParams.get("acct");
if (acctUri == null) {
	throw new Error("acct required");
}

// If the user is already logged in, ask whether to follow using the current account.
if (isSignedIn(me)) {
	const { canceled } = await os.confirm({
		type: "question",
		text: i18n.ts.useThisAccountConfirm,
		okText: i18n.ts.yes,
		cancelText: i18n.ts.no,
	});

	// use the current account
	if (!canceled) {
		waiting();
		window.location.href = `/authorize-follow?acct=${acctUri}`;
	}
}

// Otherwise ask the user what the other account ID is
const remoteAccountId = await os.inputText({
	text: i18n.ts.inputAccountId,
	isPlaintext: true,
});

// If the user do not want enter uri, the user will be redirected to the user page.
if (!remoteAccountId.result) {
	waiting();
	window.location.href = `/@${acctUri}`;
} else {
	const remoteAcctInfo = acct.parse(remoteAccountId.result);

	// If the user on this server, redirect directly
	if (remoteAcctInfo.host === hostRaw || remoteAcctInfo.host === null) {
		waiting();
		window.location.href = `/authorize-follow?acct=${acctUri}`;
	} else {
		waiting();
		// If not, find the interaction url through webfinger interface
		fetch(
			`https://${remoteAcctInfo.host}/.well-known/webfinger?resource=${remoteAcctInfo.username}@${remoteAcctInfo.host}`,
			{
				method: "GET",
			},
		)
			.then((response) => response.json())
			.then((data) => {
				const subscribeUri = data.links.find(
					(link: { rel: string }) =>
						link.rel === "http://ostatus.org/schema/1.0/subscribe",
				).template;
				window.location.href = subscribeUri.replace(
					"{uri}",
					acctUri.includes("@") ? acctUri : `${acctUri}@${hostRaw}`,
				);
			})
			.catch((_) => {
				// TODO: It would be better to provide more information, but the priority of
				// waiting component is too high and the pop-up window will be blocked.
				window.location.href = `/@${acctUri}`;
			});
	}
}
</script>
