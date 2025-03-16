import define from "@/server/api/define.js";
import { createImportCustomEmojisJob } from "@/queue/index.js";
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ["admin", "emoji"],

	secure: true,
	requireCredential: true,
	requireModerator: false,

	errors: {
		accessDenied: {
			message: "Access denied.",
			code: "ACCESS_DENIED",
			id: "fe8d7103-0ea8-4ec3-814d-f8b401dc69e9",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		fileId: { type: "string", format: "misskey:id" },
	},
	required: ["fileId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	// require emoji "add" permission
	if (
		!(user.isAdmin || user.isModerator || user.emojiModPerm !== "unauthorized")
	)
		throw new ApiError(meta.errors.accessDenied);

	createImportCustomEmojisJob(user, ps.fileId);
});
