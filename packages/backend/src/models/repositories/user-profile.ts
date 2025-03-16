import { db } from "@/db/postgre.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import mfm from "mfm-js";
import { extractMentions } from "@/misc/extract-mentions.js";
import {
	type ProfileMention,
	resolveMentionToUserAndProfile,
} from "@/remote/resolve-user.js";
import type {
	IMentionedRemoteUser,
	IMentionedRemoteUsers,
} from "@/models/entities/note.js";
import { unique } from "@/prelude/array.js";
import { config } from "@/config.js";
import { Mutex, Semaphore } from "async-mutex";

const queue = new Semaphore(5);

export const UserProfileRepository = db.getRepository(UserProfile).extend({
	// We must never await this without promiseEarlyReturn, otherwise giant webring-style profile mention trees will cause the queue to stop working
	async updateMentions(
		id: UserProfile["userId"],
		limiter: RecursionLimiter = new RecursionLimiter(),
	) {
		const profile = await this.findOneBy({ userId: id });
		if (!profile) return;
		const tokens: mfm.MfmNode[] = [];

		if (profile.description) tokens.push(...mfm.parse(profile.description));
		if (profile.fields.length > 0)
			tokens.push(
				...profile.fields.flatMap((p) =>
					mfm.parse(p.value).concat(mfm.parse(p.name)),
				),
			);

		return queue.runExclusive(async () => {
			const partial = {
				mentions: await populateMentions(tokens, profile.userHost, limiter),
			};
			return UserProfileRepository.update(profile.userId, partial);
		});
	},
});

async function populateMentions(
	tokens: mfm.MfmNode[],
	objectHost: string | null,
	limiter: RecursionLimiter,
): Promise<IMentionedRemoteUsers> {
	const mentions = extractMentions(tokens);
	const resolved = await Promise.all(
		mentions.map((m) =>
			resolveMentionToUserAndProfile(m.username, m.host, objectHost, limiter),
		),
	);
	const remote = resolved.filter(
		(p): p is ProfileMention =>
			!!p &&
			p.data.host !== config.host &&
			(p.data.host !== null || objectHost !== null),
	);
	const res = remote.map((m) => {
		return {
			uri: m.user.uri,
			url: m.profile?.url ?? undefined,
			username: m.data.username,
			host: m.data.host,
		} as IMentionedRemoteUser;
	});

	return unique(res);
}

export class RecursionLimiter {
	private counter;
	private mutex = new Mutex();
	constructor(count = 10) {
		this.counter = count;
	}

	public shouldContinue(): Promise<boolean> {
		return this.mutex.runExclusive(() => {
			return this.counter-- > 0;
		});
	}
}
