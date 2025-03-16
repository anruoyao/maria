import type { entities, noteVisibilities } from "firefish-js";

export type NoteVisibility = (typeof noteVisibilities)[number] | "private";

export interface NoteTranslation {
	sourceLang: string;
	text: string;
}

export type NoteType = entities.Note & {
	_featuredId_?: string;
	_prId_?: string;
};

export interface NoteFolded {
	id: string;
	key: string;
	createdAt: entities.Note["createdAt"];
	folded: "renote";
	note: entities.Note;
	renotesArr: entities.Note[];
}

export interface NoteThread {
	id: string;
	createdAt: entities.Note["createdAt"];
	folded: "thread";
	note: entities.Note;
	parents: entities.Note[];
}
