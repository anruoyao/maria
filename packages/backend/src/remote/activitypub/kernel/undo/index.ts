import type { CacheableRemoteUser } from "@/models/entities/user.js";
import type { IUndo } from "../../type.js";
import {
	isFollow,
	isBlock,
	isLike,
	isAnnounce,
	getApType,
	isAccept,
} from "../../type.js";
import unfollow from "./follow.js";
import unblock from "./block.js";
import undoLike from "./like.js";
import undoAccept from "./accept.js";
import { undoAnnounce } from "./announce.js";
import Resolver from "../../resolver.js";
import { apLogger } from "../../logger.js";
import { inspect } from "node:util";

export default async (
	actor: CacheableRemoteUser,
	activity: IUndo,
): Promise<string> => {
	if ("actor" in activity && actor.uri !== activity.actor) {
		throw new Error("invalid actor");
	}

	const uri = activity.id || activity;

	apLogger.info(`Undo: ${uri}`);

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch((e) => {
		apLogger.info(`Failed to resolve AP object: ${e}`);
		apLogger.debug(inspect(e));
		throw e;
	});

	if (isFollow(object)) return await unfollow(actor, object);
	if (isBlock(object)) return await unblock(actor, object);
	if (isLike(object)) return await undoLike(actor, object);
	if (isAnnounce(object)) return await undoAnnounce(actor, object);
	if (isAccept(object)) return await undoAccept(actor, object);

	return `skip: unknown object type ${getApType(object)}`;
};
