import define from "@/server/api/define.js";
import { Emojis } from "@/models/index.js";
import { In } from "typeorm";
import { db } from "@/db/postgre.js";
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ["admin", "emoji"],

	requireCredential: true,
	requireModerator: false,

	errors: {
		accessDenied: {
			message: "Access denied.",
			code: "ACCESS_DENIED",
			id: "fe8d7103-0ea8-4ec3-814d-f8b401dc69e9",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		ids: {
			type: "array",
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
		aliases: {
			type: "array",
			items: {
				type: "string",
			},
		},
	},
	required: ["ids", "aliases"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	// require emoji mod permission
	if (
		!(me.isAdmin || me.isModerator || ["mod", "full"].includes(me.emojiModPerm))
	)
		throw new ApiError(meta.errors.accessDenied);

	const emojis = await Emojis.findBy({
		id: In(ps.ids),
	});

	for (const emoji of emojis) {
		await Emojis.update(emoji.id, {
			updatedAt: new Date(),
			aliases: emoji.aliases.filter((x) => !ps.aliases.includes(x)),
		});
	}

	await db.queryResultCache!.remove(["meta_emojis"]);
});
