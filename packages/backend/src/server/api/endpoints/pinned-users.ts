import { IsNull } from "typeorm";
import { Users } from "@/models/index.js";
import { fetchMeta, stringToAcct } from "backend-rs";
import type { User } from "@/models/entities/user.js";
import define from "@/server/api/define.js";

export const meta = {
	tags: ["users"],

	requireCredential: false,
	requireCredentialPrivateMode: false,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "UserDetailed",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const instanceMeta = await fetchMeta();

	const users = await Promise.all(
		instanceMeta.pinnedUsers
			.map((acct) => stringToAcct(acct))
			.map((acct) =>
				Users.findOneBy({
					usernameLower: acct.username.toLowerCase(),
					host: acct.host ?? IsNull(),
				}),
			),
	);

	return await Users.packMany(users.filter((x) => x != null) as User[], me, {
		detail: true,
	});
});
