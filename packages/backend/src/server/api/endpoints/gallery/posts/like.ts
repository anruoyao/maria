import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { GalleryPosts, GalleryLikes } from "@/models/index.js";
import { genIdAt } from "backend-rs";

export const meta = {
	tags: ["gallery"],

	requireCredential: true,

	kind: "write:gallery-likes",

	errors: {
		noSuchPost: {
			message: "No such post.",
			code: "NO_SUCH_POST",
			id: "56c06af3-1287-442f-9701-c93f7c4a62ff",
		},

		alreadyLiked: {
			message: "The post has already been liked.",
			code: "ALREADY_LIKED",
			id: "40e9ed56-a59c-473a-bf3f-f289c54fb5a7",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		postId: { type: "string", format: "misskey:id" },
	},
	required: ["postId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const post = await GalleryPosts.findOneBy({ id: ps.postId });
	if (post == null) {
		throw new ApiError(meta.errors.noSuchPost);
	}

	// if already liked
	const exists = await GalleryLikes.existsBy({
		postId: post.id,
		userId: user.id,
	});

	if (exists) {
		throw new ApiError(meta.errors.alreadyLiked);
	}

	const now = new Date();

	// Create like
	await GalleryLikes.insert({
		id: genIdAt(now),
		createdAt: now,
		postId: post.id,
		userId: user.id,
	});

	GalleryPosts.increment({ id: post.id }, "likedCount", 1);
});
