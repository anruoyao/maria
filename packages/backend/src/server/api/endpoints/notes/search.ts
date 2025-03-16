import { Notes } from "@/models/index.js";
import type { Note } from "@/models/entities/note.js";
import define from "@/server/api/define.js";
import { sqlLikeEscape } from "backend-rs";
import { searchNotes, type SearchParams } from "@/misc/search.js";

export const meta = {
	tags: ["notes"],

	requireCredential: false,
	requireCredentialPrivateMode: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Note",
		},
	},

	errors: {},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		query: { type: "string" },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		sinceDate: { type: "number", nullable: true },
		untilDate: { type: "number", nullable: true },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		offset: { type: "integer", default: 0 },
		host: {
			type: "string",
			nullable: true,
			description: "The local host is represented with `null`.",
		},
		userId: {
			type: "string",
			format: "misskey:id",
			nullable: true,
			default: null,
		},
		withFiles: { type: "boolean", nullable: true },
		searchCwAndAlt: { type: "boolean", nullable: true },
		channelId: {
			type: "string",
			format: "misskey:id",
			nullable: true,
			default: null,
		},
		order: {
			type: "string",
			default: "chronological",
			nullable: true,
			description: "Either 'chronological' or 'relevancy'",
		},
	},
	required: ["query"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	let notes: Note[];

	const params: SearchParams = {
		withFilesOnly: ps.withFiles ?? false,
		limit: ps.limit,
		myId: me?.id,
		sinceId: ps.sinceId,
		untilId: ps.untilId,
		sinceDate: ps.sinceDate ?? undefined,
		untilDate: ps.untilDate ?? undefined,
		userId: ps.userId,
		channelId: ps.channelId,
		host: ps.host,
	};

	if (ps.query != null) {
		const searchWord = sqlLikeEscape(ps.query);

		if (ps.searchCwAndAlt) {
			// Whether we should return latest notes first
			const isDescendingOrder =
				(ps.sinceId == null || ps.untilId != null) &&
				(ps.sinceId != null ||
					ps.untilId != null ||
					ps.sinceDate == null ||
					ps.untilDate != null);

			const compare = isDescendingOrder
				? (lhs: Note, rhs: Note) =>
						Math.sign(rhs.createdAt.getTime() - lhs.createdAt.getTime())
				: (lhs: Note, rhs: Note) =>
						Math.sign(lhs.createdAt.getTime() - rhs.createdAt.getTime());

			notes = [
				...new Map(
					(
						await Promise.all([
							searchNotes(params, (query) => {
								query.andWhere("note.text &@~ :q", { q: searchWord });
							}),
							searchNotes(params, (query) => {
								query.andWhere("note.cw &@~ :q", { q: searchWord });
							}),
							searchNotes(params, (query) => {
								query
									.andWhere("drive_file.comment &@~ :q", { q: searchWord })
									.innerJoin("note.files", "drive_file");
							}),
						])
					)
						.flatMap((e) => e)
						.map((note) => [note.id, note]),
				).values(),
			]
				.sort(compare)
				.slice(0, ps.limit);
		} else {
			notes = await searchNotes(params, (query) => {
				query.andWhere("note.text &@~ :q", { q: searchWord });
			});
		}
	} else {
		notes = await searchNotes(params);
	}

	return await Notes.packMany(notes, me);
});
