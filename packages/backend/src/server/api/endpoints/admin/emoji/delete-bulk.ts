import define from "@/server/api/define.js";
import { Emojis } from "@/models/index.js";
import { In } from "typeorm";
import { insertModerationLog } from "@/services/insert-moderation-log.js";
import { db } from "@/db/postgre.js";
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ["admin"],

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
	},
	required: ["ids"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	// require emoji "full" permission
	if (!(me.isAdmin || me.isModerator || me.emojiModPerm === "full"))
		throw new ApiError(meta.errors.accessDenied);

	const emojis = await Emojis.findBy({
		id: In(ps.ids),
	});

	for (const emoji of emojis) {
		await Emojis.delete(emoji.id);

		await db.queryResultCache!.remove(["meta_emojis"]);

		insertModerationLog(me, "deleteEmoji", {
			emoji: emoji,
		});
	}
});
