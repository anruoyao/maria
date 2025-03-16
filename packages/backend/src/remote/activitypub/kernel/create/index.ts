import Resolver from "../../resolver.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import createNote from "./note.js";
import type { ICreate } from "../../type.js";
import { getApId, isPost, getApType } from "../../type.js";
import { apLogger } from "../../logger.js";
import { toArray, concat, unique } from "@/prelude/array.js";
import { inspect } from "node:util";

export default async (
	actor: CacheableRemoteUser,
	activity: ICreate,
): Promise<void> => {
	const uri = getApId(activity);

	apLogger.info(`Create: ${uri}`);

	// copy audiences between activity <=> object.
	if (typeof activity.object === "object") {
		const to = unique(
			concat([toArray(activity.to), toArray(activity.object.to)]),
		);
		const cc = unique(
			concat([toArray(activity.cc), toArray(activity.object.cc)]),
		);

		activity.to = to;
		activity.cc = cc;
		activity.object.to = to;
		activity.object.cc = cc;
	}

	// If there is no attributedTo, use Activity actor.
	if (typeof activity.object === "object" && !activity.object.attributedTo) {
		activity.object.attributedTo = activity.actor;
	}

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch((e) => {
		apLogger.info(`Failed to resolve AP object: ${e}`);
		apLogger.debug(inspect(e));
		throw e;
	});

	if (isPost(object)) {
		createNote(resolver, actor, object, false, activity);
	} else {
		apLogger.info(`Unknown type: ${getApType(object)}`);
	}
};
