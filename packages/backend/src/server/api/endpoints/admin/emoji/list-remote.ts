import define from "@/server/api/define.js";
import { Emojis } from "@/models/index.js";
import { sqlLikeEscape, toPuny } from "backend-rs";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
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
					type: "string",
					optional: false,
					nullable: true,
					description: "The local host is represented with `null`.",
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
		host: {
			type: "string",
			nullable: true,
			default: null,
			description: "Use `null` to represent the local host.",
		},
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
	);

	if (ps.host == null) {
		q.andWhere("emoji.host IS NOT NULL");
	} else {
		q.andWhere("emoji.host = :host", { host: toPuny(ps.host) });
	}

	if (ps.query) {
		q.andWhere("emoji.name like :query", {
			query: `%${sqlLikeEscape(ps.query)}%`,
		});
	}

	const emojis = await q.orderBy("emoji.id", "DESC").take(ps.limit).getMany();

	return Emojis.packMany(emojis);
});
