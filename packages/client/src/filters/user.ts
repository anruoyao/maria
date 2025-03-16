import { acct } from "firefish-js";
import type { Acct, entities } from "firefish-js";
import { url } from "@/config";

export const userName = (user: entities.User) => {
	return user.name || user.username;
};

export const userPage = (user: Acct, path?, absolute = false) => {
	return `${absolute ? url : ""}/@${acct.toString(user)}${
		path ? `/${path}` : ""
	}`;
};
