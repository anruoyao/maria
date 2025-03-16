import { reactive } from "vue";
import type { Account } from "@/account";

const accountData = localStorage.getItem("account");

// TODO: 外部からはreadonlyに
export const me = accountData
	? reactive(JSON.parse(accountData) as Account)
	: null;

export const isSignedIn = (i: typeof me): i is Account => i != null;
export const isModerator = me != null && (me.isModerator || me.isAdmin);
export const isEmojiMod = isModerator || me?.emojiModPerm !== "unauthorized";
export const isAdmin = me?.isAdmin;
