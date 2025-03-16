import type { Packed } from "./schema.js";

type NoteWithUserHost = { user: { host: string | null } | null };

export function isInstanceMuted(
	note: NoteWithUserHost & {
		reply: NoteWithUserHost | null;
		renote: NoteWithUserHost | null;
	},
	mutedInstances: Set<string>,
): boolean {
	if (mutedInstances.has(note?.user?.host ?? "")) return true;
	if (mutedInstances.has(note?.reply?.user?.host ?? "")) return true;
	if (mutedInstances.has(note?.renote?.user?.host ?? "")) return true;

	return false;
}

export function isUserFromMutedInstance(
	notif: Packed<"Notification">,
	mutedInstances: Set<string>,
): boolean {
	if (mutedInstances.has(notif?.user?.host ?? "")) return true;

	return false;
}
