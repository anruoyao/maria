import define from "@/server/api/define.js";
import { AccessTokens } from "@/models/index.js";
import { publishToUserStream, UserEvent } from "backend-rs";

export const meta = {
	requireCredential: true,

	secure: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {
		tokenId: { type: "string", format: "misskey:id" },
	},
	required: ["tokenId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const exists = await AccessTokens.existsBy({ id: ps.tokenId });

	if (exists) {
		await AccessTokens.delete({
			id: ps.tokenId,
			userId: user.id,
		});

		// Terminate streaming
		await publishToUserStream(user.id, UserEvent.Disconnect, {});
	}
});
