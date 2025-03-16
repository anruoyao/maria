import define from "@/server/api/define.js";
import { UserProfiles, AttestationChallenges } from "@/models/index.js";
import { promisify } from "node:util";
import * as crypto from "node:crypto";
import { genIdAt, verifyPassword } from "backend-rs";
import { hash } from "@/server/api/2fa.js";

const randomBytes = promisify(crypto.randomBytes);

export const meta = {
	requireCredential: true,

	secure: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {
		password: { type: "string" },
	},
	required: ["password"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const profile = await UserProfiles.findOneByOrFail({ userId: user.id });

	// Compare passwords
	const same = verifyPassword(ps.password, profile.password!);

	if (!same) {
		throw new Error("incorrect password");
	}

	// 32 byte challenge
	const entropy = await randomBytes(32);
	const challenge = entropy
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	const now = new Date();
	const challengeId = genIdAt(now);

	await AttestationChallenges.insert({
		userId: user.id,
		id: challengeId,
		challenge: hash(Buffer.from(challenge, "utf-8")).toString("hex"),
		createdAt: now,
		registrationChallenge: true,
	});

	return {
		challengeId,
		challenge,
	};
});
