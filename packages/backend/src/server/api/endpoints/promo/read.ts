import { PromoReads } from "@/models/index.js";
import { genIdAt } from "backend-rs";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { getNote } from "@/server/api/common/getters.js";

export const meta = {
	tags: ["notes"],

	requireCredential: true,

	errors: {
		noSuchNote: {
			message: "No such note.",
			code: "NO_SUCH_NOTE",
			id: "d785b897-fcd3-4fe9-8fc3-b85c26e6c932",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		noteId: { type: "string", format: "misskey:id" },
	},
	required: ["noteId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const note = await getNote(ps.noteId, user).catch((err) => {
		if (err.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24")
			throw new ApiError(meta.errors.noSuchNote);
		throw err;
	});

	const exists = await PromoReads.existsBy({
		noteId: note.id,
		userId: user.id,
	});

	if (exists) {
		return;
	}

	const now = new Date();

	await PromoReads.insert({
		id: genIdAt(now),
		createdAt: now,
		noteId: note.id,
		userId: user.id,
	});
});
