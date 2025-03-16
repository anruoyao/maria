import { Pages, PageLikes } from "@/models/index.js";
import { genIdAt } from "backend-rs";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ["pages"],

	requireCredential: true,

	kind: "write:page-likes",

	errors: {
		noSuchPage: {
			message: "No such page.",
			code: "NO_SUCH_PAGE",
			id: "cc98a8a2-0dc3-4123-b198-62c71df18ed3",
		},

		alreadyLiked: {
			message: "The page has already been liked.",
			code: "ALREADY_LIKED",
			id: "cc98a8a2-0dc3-4123-b198-62c71df18ed3",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		pageId: { type: "string", format: "misskey:id" },
	},
	required: ["pageId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const page = await Pages.findOneBy({ id: ps.pageId });
	if (page == null) {
		throw new ApiError(meta.errors.noSuchPage);
	}

	// if already liked
	const exists = await PageLikes.existsBy({
		pageId: page.id,
		userId: user.id,
	});

	if (exists) {
		throw new ApiError(meta.errors.alreadyLiked);
	}

	const now = new Date();

	// Create like
	await PageLikes.insert({
		id: genIdAt(now),
		createdAt: now,
		pageId: page.id,
		userId: user.id,
	});

	Pages.increment({ id: page.id }, "likedCount", 1);
});
