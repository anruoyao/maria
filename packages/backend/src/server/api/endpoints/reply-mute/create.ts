import { genIdAt } from "backend-rs";
import { ReplyMutings } from "@/models/index.js";
import type { ReplyMuting } from "@/models/entities/reply-muting.js";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { getUser } from "@/server/api/common/getters.js";

export const meta = {
	tags: ["account"],

	requireCredential: true,

	kind: "write:mutes",

	errors: {
		noSuchUser: {
			message: "No such user.",
			code: "NO_SUCH_USER",
			id: "6fef56f3-e765-4957-88e5-c6f65329b8a5",
		},

		alreadyMuting: {
			message: "You are already muting that user.",
			code: "ALREADY_MUTING",
			id: "7e7359cb-160c-4956-b08f-4d1c653cd007",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		userId: { type: "string", format: "misskey:id" },
	},
	required: ["userId"],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const muter = user;

	// Get mutee
	const mutee = await getUser(ps.userId).catch((e) => {
		if (e.id === "15348ddd-432d-49c2-8a5a-8069753becff")
			throw new ApiError(meta.errors.noSuchUser);
		throw e;
	});

	// Check if already muting
	const exists = await ReplyMutings.existsBy({
		muterId: muter.id,
		muteeId: mutee.id,
	});

	if (exists) {
		throw new ApiError(meta.errors.alreadyMuting);
	}

	const now = new Date();

	// Create mute
	await ReplyMutings.insert({
		id: genIdAt(now),
		createdAt: now,
		muterId: muter.id,
		muteeId: mutee.id,
	} as ReplyMuting);

	// await publishToUserStream(user.id, UserEvent.ReplyMute, mutee);
});
