import define from "@/server/api/define.js";
import { latestVersion } from "backend-rs";

export const meta = {
	tags: ["meta"],

	requireCredential: false,
	requireCredentialPrivateMode: true,
	allowGet: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	return {
		latest_version: await latestVersion(),
	};
});
