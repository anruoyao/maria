import define from "@/server/api/define.js";
import { Emojis } from "@/models/index.js";
import { ApiError } from "@/server/api/error.js";
import { db } from "@/db/postgre.js";

export const meta = {
	tags: ["admin", "emoji"],

	requireCredential: true,
	requireModerator: false,

	errors: {
		noSuchEmoji: {
			message: "No such emoji.",
			code: "NO_SUCH_EMOJI",
			id: "684dec9d-a8c2-4364-9aa8-456c49cb1dc8",
		},
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
		id: { type: "string", format: "misskey:id" },
		name: { type: "string" },
		category: {
			type: "string",
			nullable: true,
			description: "Use `null` to reset the category.",
		},
		aliases: {
			type: "array",
			items: {
				type: "string",
			},
		},
		license: {
			type: "string",
			nullable: true,
		},
	},
	required: ["id", "name", "aliases"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	// require emoji "add" permission
	if (!(me.isAdmin || me.isModerator || me.emojiModPerm !== "unauthorized"))
		throw new ApiError(meta.errors.accessDenied);

	const emoji = await Emojis.findOneBy({ id: ps.id });

	if (emoji == null) throw new ApiError(meta.errors.noSuchEmoji);

	// require emoji "mod" permission if a category/alias/license has already been set
	if (me.emojiModPerm === "add") {
		if (
			emoji.category != null ||
			emoji.aliases.length > 0 ||
			emoji.license != null
		)
			throw new ApiError(meta.errors.accessDenied);
	}

	await Emojis.update(emoji.id, {
		updatedAt: new Date(),
		name: ps.name,
		category: ps.category,
		aliases: ps.aliases,
		license: ps.license,
	});

	await db.queryResultCache!.remove(["meta_emojis"]);
});
