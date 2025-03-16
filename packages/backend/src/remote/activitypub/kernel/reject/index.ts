import Resolver from "../../resolver.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import rejectFollow from "./follow.js";
import type { IReject } from "../../type.js";
import { isFollow, getApType } from "../../type.js";
import { apLogger } from "../../logger.js";
import { inspect } from "node:util";

const logger = apLogger;

export default async (
	actor: CacheableRemoteUser,
	activity: IReject,
): Promise<string> => {
	const uri = activity.id || activity;

	apLogger.info(`Reject: ${uri}`);

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch((e) => {
		apLogger.info(`Failed to resolve AP object: ${e}`);
		apLogger.debug(inspect(e));
		throw e;
	});

	if (isFollow(object)) return await rejectFollow(actor, object);

	return `skip: Unknown Reject type: ${getApType(object)}`;
};
