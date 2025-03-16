// import { IsNull } from 'typeorm';
import { fetchMeta } from "backend-rs";
import define from "@/server/api/define.js";

export const meta = {
	tags: ["meta"],

	requireCredential: false,
	requireCredentialPrivateMode: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "string",
			optional: false,
			nullable: false,
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	const instanceMeta = await fetchMeta();
	const icons = await Promise.all(instanceMeta.customSplashIcons.map((x) => x));
	return icons;
});
