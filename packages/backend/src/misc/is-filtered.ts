import type { User } from "@/models/entities/user.js";
import type { Note } from "@/models/entities/note.js";
import type { UserProfile } from "@/models/entities/user-profile.js";
import { checkWordMute } from "backend-rs";
import { Cache } from "@/misc/cache.js";
import { UserProfiles } from "@/models/index.js";

const filteredNoteCache = new Cache<boolean>("filteredNote", 60 * 60 * 24);
const mutedWordsCache = new Cache<
	Pick<UserProfile, "mutedWords" | "mutedPatterns">
>("mutedWords", 60 * 5);

export async function isFiltered(
	note: Note,
	user: { id: User["id"] } | null | undefined,
): Promise<boolean> {
	if (!user) return false;
	const profile = await mutedWordsCache.fetch(user.id, () =>
		UserProfiles.findOneBy({ userId: user.id }).then((p) => ({
			mutedWords: p?.mutedWords ?? [],
			mutedPatterns: p?.mutedPatterns ?? [],
		})),
	);

	if (
		!profile ||
		(profile.mutedPatterns.length < 1 && profile.mutedWords.length < 1)
	)
		return false;
	const ts = (note.updatedAt ?? note.createdAt) as Date | string;
	const identifier =
		(typeof ts === "string" ? new Date(ts) : ts)?.getTime() ?? "0";
	return filteredNoteCache.fetch(`${note.id}:${identifier}:${user.id}`, () =>
		checkWordMute(note, profile.mutedWords, profile.mutedPatterns),
	);
}
