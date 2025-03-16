import { NoteEdits } from "@/models/index.js";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { getNote } from "@/server/api/common/getters.js";
import type { NoteEdit } from "@/models/entities/note-edit.js";

export const meta = {
	tags: ["notes"],

	requireCredential: false,
	requireCredentialPrivateMode: true,
	description: "Get edit history of a note",

	res: {
		type: "array",
		optional: false,
		nullable: true,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "NoteEdit",
		},
	},

	errors: {
		noSuchNote: {
			message: "No such note.",
			code: "NO_SUCH_NOTE",
			id: "e1035875-9551-45ec-afa8-1ded1fcb53c8",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		noteId: {
			type: "string",
			format: "misskey:id",
		},
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		offset: { type: "integer", default: 0 },
	},
	required: ["noteId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const note = await getNote(ps.noteId, user).catch((err) => {
		if (err.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24")
			throw new ApiError(meta.errors.noSuchNote);
		throw err;
	});

	const history: NoteEdit[] = await NoteEdits.find({
		where: {
			noteId: note.id,
		},
		take: ps.limit,
		skip: ps.offset,
		order: {
			id: "DESC",
		},
	});

	return await NoteEdits.packMany(history, note);
});
