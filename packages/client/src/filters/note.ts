import type { entities } from "firefish-js";

export function notePage(
	note: entities.Note,
	options?: {
		historyPage?: boolean;
	},
) {
	if (options?.historyPage) {
		return `/notes/${note.id}/history`;
	}
	if (note.historyId) {
		return `/notes/${note.id}/history#${note.historyId}`;
	}
	return `/notes/${note.id}`;
}
