import type { entities } from "firefish-js";
import { defineAsyncComponent } from "vue";
import { i18n } from "./i18n";
import { apiUrl } from "@/config";
import { me } from "@/me";
import { alert, api, popup, popupMenu, waiting } from "@/os";
import icon from "@/scripts/icon";
import { del, get, set } from "@/scripts/idb-proxy";
import { reloadChannel, unisonReload } from "@/scripts/unison-reload";
import type { MenuUser } from "./types/menu";

// TODO: 他のタブと永続化されたstateを同期

export type Account = entities.MeDetailed;

export async function signOut() {
	waiting();
	localStorage.removeItem("account");

	await removeAccount(me!.id);

	const accounts = await getAccounts();

	// #region Remove service worker registration
	try {
		if (navigator.serviceWorker.controller) {
			const registration = await navigator.serviceWorker.ready;
			const push = await registration.pushManager.getSubscription();
			if (push) {
				await api("sw/unregister", {
					endpoint: push.endpoint,
					i: me!.token, // FIXME: This parameter seems to be removable but I didn't test it
				});
			}
		}

		if (accounts.length === 0) {
			await navigator.serviceWorker.getRegistrations().then((registrations) => {
				return Promise.all(
					registrations.map((registration) => registration.unregister()),
				);
			});
		}
	} catch (err) {}
	// #endregion

	document.cookie = "igi=; path=/";

	if (accounts.length > 0) signIn(accounts[0].token);
	else unisonReload("/");
}

export async function getAccounts(): Promise<
	{ id: Account["id"]; token: Account["token"] }[]
> {
	return (await get("accounts")) || [];
}

export async function addAccount(id: Account["id"], token: Account["token"]) {
	const accounts = await getAccounts();
	if (!accounts.some((x) => x.id === id)) {
		await set("accounts", accounts.concat([{ id, token }]));
	}
}

export async function removeAccount(id: Account["id"]) {
	const accounts = await getAccounts();
	accounts.splice(
		accounts.findIndex((x) => x.id === id),
		1,
	);

	if (accounts.length > 0) await set("accounts", accounts);
	else await del("accounts");
}

function fetchAccount(token: string): Promise<Account> {
	return new Promise((done, fail) => {
		// Fetch user
		fetch(`${apiUrl}/i`, {
			method: "POST",
			body: JSON.stringify({
				i: token,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					if (res.error.id === "a8c724b3-6e9c-4b46-b1a8-bc3ed6258370") {
						showSuspendedDialog();
						signOut();
					} else {
						alert({
							type: "error",
							title: i18n.ts.failedToFetchAccountInformation,
							text: JSON.stringify(res.error),
						});
					}
				} else {
					res.token = token;
					done(res);
				}
			})
			.catch(fail);
	});
}

function showSuspendedDialog() {
	alert({
		type: "error",
		title: i18n.ts.yourAccountSuspendedTitle,
		text: i18n.ts.yourAccountSuspendedDescription,
	});
}

export function updateAccount(accountData) {
	for (const [key, value] of Object.entries(accountData)) {
		me![key] = value;
	}
	localStorage.setItem("account", JSON.stringify(me));
}

export async function refreshAccount() {
	const accountData = await fetchAccount(me!.token);
	return updateAccount(accountData);
}

export async function signIn(token: Account["token"], redirect?: string) {
	waiting();
	if (_DEV_) console.log("logging as token ", token);
	const newAccount = await fetchAccount(token);
	localStorage.setItem("account", JSON.stringify(newAccount));
	if (newAccount.lang) {
		localStorage.setItem("lang", newAccount.lang);
	}
	document.cookie = `token=${token}; path=/; max-age=31536000`; // bull dashboardの認証とかで使う
	await addAccount(newAccount.id, token);

	if (redirect) {
		// 他のタブは再読み込みするだけ
		reloadChannel.postMessage(null);
		// このページはredirectで指定された先に移動
		location.href = redirect;
		return;
	}

	unisonReload();
}

export async function openAccountMenu(
	opts: {
		includeCurrentAccount?: boolean;
		withExtraOperation: boolean;
		active?: entities.UserDetailed["id"];
		onChoose?: (account: entities.UserDetailed) => void;
	},
	ev: MouseEvent,
	isMobile?: boolean,
) {
	function showSigninDialog() {
		popup(
			defineAsyncComponent(() => import("@/components/MkSigninDialog.vue")),
			{},
			{
				done: (res) => {
					addAccount(res.id, res.i);
					switchAccountWithToken(res.i);
				},
			},
			"closed",
		);
	}

	function createAccount() {
		popup(
			defineAsyncComponent(() => import("@/components/MkSignupDialog.vue")),
			{},
			{
				done: (res) => {
					addAccount(res.id, res.i);
					switchAccountWithToken(res.i);
				},
			},
			"closed",
		);
	}

	async function switchAccount(account: entities.UserDetailed) {
		const storedAccounts = await getAccounts();
		const token = storedAccounts.find((x) => x.id === account.id)!.token;
		switchAccountWithToken(token);
	}

	function switchAccountWithToken(token: string) {
		signIn(token);
	}

	const storedAccounts = await getAccounts().then((accounts) =>
		accounts.filter((x) => x.id !== me!.id),
	);
	const accountsPromise = api("users/show", {
		userIds: storedAccounts.map((x) => x.id),
	});

	function createItem(account: entities.UserDetailed): MenuUser {
		return {
			type: "user" as const,
			user: account,
			active: opts.active != null ? opts.active === account.id : false,
			action: () => {
				if (opts.onChoose) {
					opts.onChoose(account);
				} else {
					switchAccount(account);
				}
			},
		};
	}

	const accountItemPromises = storedAccounts.map(
		(a) =>
			new Promise<MenuUser>((res) => {
				accountsPromise.then((accounts) => {
					const account = accounts.find((x) => x.id === a.id);
					if (account == null) {
						// The user is deleted, remove it
						removeAccount(a.id);
						return res(null as unknown as MenuUser);
					}
					res(createItem(account));
				});
			}),
	);

	if (opts.withExtraOperation) {
		popupMenu(
			[
				...(isMobile ?? false
					? [
							{
								type: "parent" as const,
								icon: `${icon("ph-plus")}`,
								text: i18n.ts.addAccount,
								children: [
									{
										text: i18n.ts.existingAccount,
										action: () => {
											showSigninDialog();
										},
									},
									{
										text: i18n.ts.createAccount,
										action: () => {
											createAccount();
										},
									},
								],
							},
						]
					: [
							{
								type: "link" as const,
								text: i18n.ts.profile,
								to: `/@${me!.username}`,
								avatar: me!,
							},
							null,
						]),
				...(opts.includeCurrentAccount ? [createItem(me!)] : []),
				...accountItemPromises,
				...(isMobile ?? false
					? [
							null,
							{
								type: "link" as const,
								text: i18n.ts.profile,
								to: `/@${me!.username}`,
								avatar: me!,
							},
						]
					: [
							{
								type: "parent" as const,
								icon: `${icon("ph-plus")}`,
								text: i18n.ts.addAccount,
								children: [
									{
										text: i18n.ts.existingAccount,
										action: () => {
											showSigninDialog();
										},
									},
									{
										text: i18n.ts.createAccount,
										action: () => {
											createAccount();
										},
									},
								],
							},
						]),
			],
			(ev.currentTarget ?? ev.target) as HTMLElement,
			{
				align: "left",
			},
		);
	} else {
		popupMenu(
			[
				...(opts.includeCurrentAccount ? [createItem(me!)] : []),
				...accountItemPromises,
			],
			(ev.currentTarget ?? ev.target) as HTMLElement,
			{
				align: "left",
			},
		);
	}
}
