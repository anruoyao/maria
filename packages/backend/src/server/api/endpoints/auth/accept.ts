import * as crypto from "node:crypto";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { AuthSessions, AccessTokens, Apps } from "@/models/index.js";
import { genIdAt, generateSecureRandomString } from "backend-rs";

export const meta = {
	tags: ["auth"],

	requireCredential: true,

	secure: true,

	errors: {
		noSuchSession: {
			message: "No such session.",
			code: "NO_SUCH_SESSION",
			id: "9c72d8de-391a-43c1-9d06-08d29efde8df",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		token: { type: "string" },
	},
	required: ["token"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	// Fetch token
	const session = await AuthSessions.findOneBy({ token: ps.token });

	if (session == null) {
		throw new ApiError(meta.errors.noSuchSession);
	}

	// Generate access token
	const accessToken = generateSecureRandomString(32);

	// Fetch exist access token
	const exists = await AccessTokens.existsBy({
		appId: session.appId,
		userId: user.id,
	});

	if (!exists) {
		// Lookup app
		const app = await Apps.findOneByOrFail({ id: session.appId });

		// Generate Hash
		const sha256 = crypto.createHash("sha256");
		sha256.update(accessToken + app.secret);
		const hash = sha256.digest("hex");

		const now = new Date();

		// Insert access token doc
		await AccessTokens.insert({
			id: genIdAt(now),
			createdAt: now,
			lastUsedAt: now,
			appId: session.appId,
			userId: user.id,
			token: accessToken,
			hash: hash,
		});
	}

	// Update session
	await AuthSessions.update(session.id, {
		userId: user.id,
	});
});
