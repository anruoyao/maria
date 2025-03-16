import define from "@/server/api/define.js";
import { Users, UserProfiles } from "@/models/index.js";
import {
	Event,
	generateUserToken,
	InternalEvent,
	publishToInternalStream,
	publishToMainStream,
	publishToUserStream,
	UserEvent,
	verifyPassword,
} from "backend-rs";

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
	const freshUser = await Users.findOneByOrFail({ id: user.id });
	const oldToken = freshUser.token;

	const profile = await UserProfiles.findOneByOrFail({ userId: user.id });

	// Compare passwords
	const same = verifyPassword(ps.password, profile.password!);

	if (!same) {
		throw new Error("incorrect password");
	}

	const newToken = generateUserToken();

	await Users.update(user.id, {
		token: newToken,
	});

	// Publish event
	publishToInternalStream(InternalEvent.Token, {
		id: user.id,
		oldToken,
		newToken,
	});
	publishToMainStream(user.id, Event.RegenerateMyToken, {});

	// Terminate streaming
	setTimeout(() => {
		publishToUserStream(user.id, UserEvent.Disconnect, {});
	}, 5000);
});
