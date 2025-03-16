import define from "@/server/api/define.js";
import { Apps } from "@/models/index.js";
import { genIdAt, generateSecureRandomString } from "backend-rs";
import { unique } from "@/prelude/array.js";

export const meta = {
	tags: ["app"],

	requireCredential: false,

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "App",
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		name: { type: "string" },
		description: { type: "string" },
		permission: {
			type: "array",
			uniqueItems: true,
			items: {
				type: "string",
			},
		},
		callbackUrl: { type: "string", nullable: true },
	},
	required: ["name", "description", "permission"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	if (user?.movedToUri != null)
		return await Apps.pack("", null, {
			detail: true,
			includeSecret: true,
		});
	// Generate secret
	const secret = generateSecureRandomString(32);

	// for backward compatibility
	const permission = unique(
		ps.permission.map((v) => v.replace(/^(.+)(\/|-)(read|write)$/, "$3:$1")),
	);

	// Create account
	const now = new Date();
	const app = await Apps.insert({
		id: genIdAt(now),
		createdAt: now,
		userId: user ? user.id : null,
		name: ps.name,
		description: ps.description,
		permission,
		callbackUrl: ps.callbackUrl,
		secret: secret,
	}).then((x) => Apps.findOneByOrFail(x.identifiers[0]));

	return await Apps.pack(app, null, {
		detail: true,
		includeSecret: true,
	});
});
