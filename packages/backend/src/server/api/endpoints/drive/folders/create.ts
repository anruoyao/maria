import { publishToDriveFolderStream } from "backend-rs";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { DriveFolders } from "@/models/index.js";
import { genIdAt } from "backend-rs";
import { toRustObject } from "@/prelude/undefined-to-null.js";

export const meta = {
	tags: ["drive"],

	requireCredential: true,

	kind: "write:drive",

	errors: {
		noSuchFolder: {
			message: "No such folder.",
			code: "NO_SUCH_FOLDER",
			id: "53326628-a00d-40a6-a3cd-8975105c0f95",
		},
	},

	res: {
		type: "object" as const,
		optional: false as const,
		nullable: false as const,
		ref: "DriveFolder",
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		name: { type: "string", default: "Untitled", maxLength: 200 },
		parentId: { type: "string", format: "misskey:id", nullable: true },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	// If the parent folder is specified
	let parent = null;
	if (ps.parentId) {
		// Fetch parent folder
		parent = await DriveFolders.findOneBy({
			id: ps.parentId,
			userId: user.id,
		});

		if (parent == null) {
			throw new ApiError(meta.errors.noSuchFolder);
		}
	}

	// Create folder
	const now = new Date();
	const folder = await DriveFolders.insert({
		id: genIdAt(now),
		createdAt: now,
		name: ps.name,
		parentId: parent != null ? parent.id : null,
		userId: user.id,
	}).then((x) => DriveFolders.findOneByOrFail(x.identifiers[0]));

	const folderObj = await DriveFolders.pack(folder);

	// Publish folderCreated event
	publishToDriveFolderStream(user.id, "create", toRustObject(folder));

	return folderObj;
});
