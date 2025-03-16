import { UserLists, UserListJoinings, Users } from "@/models/index.js";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ["lists", "users"],

	requireCredential: true,

	kind: "write:account",

	description: "Remove a user from a list.",

	errors: {
		noSuchList: {
			message: "No such list.",
			code: "NO_SUCH_LIST",
			id: "7f44670e-ab16-43b8-b4c1-ccd2ee89cc02",
		},

		noSuchUser: {
			message: "No such user.",
			code: "NO_SUCH_USER",
			id: "588e7f72-c744-4a61-b180-d354e912bda2",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		listId: { type: "string", format: "misskey:id" },
		userId: { type: "string", format: "misskey:id" },
	},
	required: ["listId", "userId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const [userExists, listExists] = await Promise.all([
		Users.existsBy({
			id: ps.userId,
		}),
		UserLists.existsBy({
			id: ps.listId,
			userId: me.id,
		}),
	]);

	if (!userExists) {
		throw new ApiError(meta.errors.noSuchUser);
	}
	if (!listExists) {
		throw new ApiError(meta.errors.noSuchList);
	}

	// Remove the user from the list
	await UserListJoinings.delete({ userListId: ps.listId, userId: ps.userId });
});
