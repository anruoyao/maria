import { ApiError } from "@/server/api/error.js";
import { getNote } from "@/server/api/common/getters.js";
import { translate } from "backend-rs";
import define from "@/server/api/define.js";

export const meta = {
	tags: ["notes"],

	requireCredential: true,
	requireCredentialPrivateMode: true,

	res: {
		type: "object",
		optional: false,
		nullable: false,
	},

	errors: {
		noSuchNote: {
			message: "No such note.",
			code: "NO_SUCH_NOTE",
			id: "bea9b03f-36e0-49c5-a4db-627a029f8971",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		noteId: { type: "string", format: "misskey:id" },
		targetLang: { type: "string" },
	},
	required: ["noteId", "targetLang"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const note = await getNote(ps.noteId, user).catch((err) => {
		if (err.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24")
			throw new ApiError(meta.errors.noSuchNote);
		throw err;
	});

	if (note.text == null) {
		return 204;
	}

	return translate(note.text, note.lang as string | null, ps.targetLang);
});
