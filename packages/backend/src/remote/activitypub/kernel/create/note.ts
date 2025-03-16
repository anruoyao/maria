import type Resolver from "../../resolver.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { createNote, fetchNote } from "../../models/note.js";
import type { IObject, ICreate } from "../../type.js";
import { getApId } from "../../type.js";
import { getApLock } from "@/misc/app-lock.js";
import { extractHost } from "backend-rs";
import { StatusError } from "@/misc/fetch.js";

/**
 * Handle post creation activity
 */
export default async function (
	resolver: Resolver,
	actor: CacheableRemoteUser,
	note: IObject,
	silent = false,
	activity?: ICreate,
): Promise<string> {
	const uri = getApId(note);

	if (typeof note === "object") {
		if (actor.uri !== note.attributedTo) {
			return "skip: actor.uri !== note.attributedTo";
		}

		if (typeof note.id === "string") {
			if (extractHost(actor.uri) !== extractHost(note.id)) {
				return "skip: host in actor.uri !== note.id";
			}
		} else {
			return "skip: note.id is not a string";
		}
	}

	const lock = await getApLock(uri);

	try {
		const exist = await fetchNote(note);
		if (exist) return "skip: note exists";

		await createNote(note, resolver, silent);
		return "ok";
	} catch (e) {
		if (e instanceof StatusError && e.isClientError) {
			return `skip ${e.statusCode}`;
		} else {
			throw e;
		}
	} finally {
		await lock.release();
	}
}
