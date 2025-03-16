import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { config } from "@/config.js";
import type { IFlag } from "../../type.js";
import { getApIds } from "../../type.js";
import { AbuseUserReports, Users } from "@/models/index.js";
import { In } from "typeorm";
import { genIdAt } from "backend-rs";

export default async (
	actor: CacheableRemoteUser,
	activity: IFlag,
): Promise<string> => {
	// The object is `(User | Note) | (User | Note) []`, but it cannot be
	// matched with all patterns of the DB schema, so the target user is the first
	// user and it is stored as a comment.
	const uris = getApIds(activity.object);

	const userIds = uris
		.filter((uri) => uri.startsWith(`${config.url}/users/`))
		.map((uri) => uri.split("/").pop()!);
	const users = await Users.findBy({
		id: In(userIds),
	});
	if (users.length < 1) return "skip";

	const now = new Date();

	await AbuseUserReports.insert({
		id: genIdAt(now),
		createdAt: now,
		targetUserId: users[0].id,
		targetUserHost: users[0].host,
		reporterId: actor.id,
		reporterHost: actor.host,
		comment: `${activity.content}\n${JSON.stringify(uris, null, 2)}`,
	});

	return "ok";
};
