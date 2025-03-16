import { Emojis } from "@/models/index.js";
import define from "@/server/api/define.js";
import { IsNull } from "typeorm";

export const meta = {
	tags: ["meta"],

	requireCredential: false,
	cacheSec: 3600,

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			emojis: {
				type: "array",
				optional: false,
				nullable: false,
				items: {
					type: "object",
					optional: false,
					nullable: false,
					ref: "Emoji",
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const emojis = await Emojis.find({
		where: {
			host: IsNull(),
		},
		order: {
			category: "ASC",
			name: "ASC",
		},
	});
	return {
		emojis: await Emojis.packMany(emojis),
	};
});
