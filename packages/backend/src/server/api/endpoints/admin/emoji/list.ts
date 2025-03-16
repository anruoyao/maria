import define from "@/server/api/define.js";
import { Emojis } from "@/models/index.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import type { Emoji } from "@/models/entities/emoji.js";
//import { sqlLikeEscape } from "backend-rs";
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ["admin", "emoji"],

	requireCredential: true,
	requireModerator: false,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			properties: {
				id: {
					type: "string",
					optional: false,
					nullable: false,
					format: "id",
				},
				aliases: {
					type: "array",
					optional: false,
					nullable: false,
					items: {
						type: "string",
						optional: false,
						nullable: false,
					},
				},
				name: {
					type: "string",
					optional: false,
					nullable: false,
				},
				category: {
					type: "string",
					optional: false,
					nullable: true,
				},
				host: {
					type: "null",
					optional: false,
					description:
						"The local host is represented with `null`. The field exists for compatibility with other API endpoints that return files.",
				},
				url: {
					type: "string",
					optional: false,
					nullable: false,
				},
				license: {
					type: "string",
					optional: false,
					nullable: true,
				},
				width: {
					type: "number",
					optional: false,
					nullable: true,
				},
				height: {
					type: "number",
					optional: false,
					nullable: true,
				},
			},
		},
	},

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
		query: { type: "string", nullable: true, default: null },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	// require emoji "add" permission
	if (!(me.isAdmin || me.isModerator || me.emojiModPerm !== "unauthorized"))
		throw new ApiError(meta.errors.accessDenied);

	const q = makePaginationQuery(
		Emojis.createQueryBuilder("emoji"),
		ps.sinceId,
		ps.untilId,
	).andWhere("emoji.host IS NULL");

	let emojis: Emoji[];

	if (ps.query) {
		//q.andWhere('emoji.name ILIKE :q', { q: `%${sqlLikeEscape(ps.query)}%` });
		//const emojis = await q.take(ps.limit).getMany();

		emojis = await q.getMany();

		emojis = emojis.filter(
			(emoji) =>
				emoji.name.includes(ps.query!) ||
				emoji.aliases.some((a) => a.includes(ps.query!)) ||
				emoji.category?.includes(ps.query!),
		);

		emojis.splice(ps.limit + 1);
	} else {
		emojis = await q.take(ps.limit).getMany();
	}

	return Emojis.packMany(emojis);
});
