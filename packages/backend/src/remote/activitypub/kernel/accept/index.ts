import Resolver from "../../resolver.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import acceptFollow from "./follow.js";
import type { IAccept } from "../../type.js";
import { isFollow, getApType } from "../../type.js";
import { apLogger } from "../../logger.js";
import { inspect } from "node:util";

export default async (
	actor: CacheableRemoteUser,
	activity: IAccept,
): Promise<string> => {
	const uri = activity.id || activity;

	apLogger.info(`Accept: ${uri}`);

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch((e) => {
		apLogger.info(`Failed to resolve AP object: ${e}`);
		apLogger.debug(inspect(e));
		throw e;
	});

	if (isFollow(object)) return await acceptFollow(actor, object);

	return `skip: Unknown Accept type: ${getApType(object)}`;
};
