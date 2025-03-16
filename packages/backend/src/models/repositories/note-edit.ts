import { db } from "@/db/postgre.js";
import { NoteEdit } from "@/models/entities/note-edit.js";
import type { Note } from "@/models/entities/note.js";
import { awaitAll } from "@/prelude/await-all.js";
import type { Packed } from "@/misc/schema.js";
import { DriveFiles } from "../index.js";
import {
	aggregateNoteEditEmojis,
	populateEmojis,
	prefetchEmojis,
} from "@/misc/populate-emojis.js";

export const NoteEditRepository = db.getRepository(NoteEdit).extend({
	async pack(noteEdit: NoteEdit, sourceNote: Note) {
		const packed: Packed<"NoteEdit"> = await awaitAll({
			id: noteEdit.id,
			noteId: noteEdit.noteId,
			updatedAt: noteEdit.updatedAt.toISOString(),
			text: noteEdit.text,
			cw: noteEdit.cw,
			fileIds: noteEdit.fileIds,
			files: DriveFiles.packMany(noteEdit.fileIds),
			emojis: populateEmojis(noteEdit.emojis, sourceNote.userHost),
		});

		return packed;
	},
	async packMany(noteEdits: NoteEdit[], sourceNote: Note) {
		if (noteEdits.length === 0) return [];

		await prefetchEmojis(
			aggregateNoteEditEmojis(noteEdits, sourceNote.userHost),
		);

		const promises = await Promise.allSettled(
			noteEdits.map((n) => this.pack(n, sourceNote)),
		);

		// filter out rejected promises, only keep fulfilled values
		return promises.flatMap((result) =>
			result.status === "fulfilled" ? [result.value] : [],
		);
	},
});
