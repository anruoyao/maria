import type { entities } from "firefish-js";
import { deletedNoteIds } from "./use-note-capture";

export function isRenote(note: entities.Note): note is entities.Note & {
	renote: entities.Note;
	text: null;
	renoteId: string;
	poll: undefined;
} {
	return (
		note.renote != null &&
		note.text == null &&
		note.fileIds.length === 0 &&
		note.poll == null
	);
}

export function isDeleted(noteId: string) {
	return deletedNoteIds.has(noteId);
}
