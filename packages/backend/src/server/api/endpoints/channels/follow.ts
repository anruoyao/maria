import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { Channels, ChannelFollowings } from "@/models/index.js";
import { genIdAt, publishToUserStream, UserEvent } from "backend-rs";

export const meta = {
	tags: ["channels"],

	requireCredential: true,

	kind: "write:channels",

	errors: {
		noSuchChannel: {
			message: "No such channel.",
			code: "NO_SUCH_CHANNEL",
			id: "c0031718-d573-4e85-928e-10039f1fbb68",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		channelId: { type: "string", format: "misskey:id" },
	},
	required: ["channelId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const channel = await Channels.findOneBy({
		id: ps.channelId,
	});

	if (channel == null) {
		throw new ApiError(meta.errors.noSuchChannel);
	}

	const now = new Date();

	await ChannelFollowings.insert({
		id: genIdAt(now),
		createdAt: now,
		followerId: user.id,
		followeeId: channel.id,
	});

	await publishToUserStream(user.id, UserEvent.FollowChannel, channel);
});
