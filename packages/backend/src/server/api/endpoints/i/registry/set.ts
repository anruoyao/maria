import define from "@/server/api/define.js";
import { RegistryItems } from "@/models/index.js";
import { Event, genIdAt, publishToMainStream } from "backend-rs";

export const meta = {
	requireCredential: true,

	secure: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {
		key: { type: "string", minLength: 1 },
		value: {},
		scope: {
			type: "array",
			default: [],
			items: {
				type: "string",
				pattern: /^[a-zA-Z0-9_]+$/.toString().slice(1, -1),
			},
		},
	},
	required: ["key", "value"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const query = RegistryItems.createQueryBuilder("item")
		.where("item.domain IS NULL")
		.andWhere("item.userId = :userId", { userId: user.id })
		.andWhere("item.key = :key", { key: ps.key })
		.andWhere("item.scope = :scope", { scope: ps.scope });

	const existingItem = await query.getOne();

	if (existingItem) {
		await RegistryItems.update(existingItem.id, {
			updatedAt: new Date(),
			value: ps.value,
		});
	} else {
		const now = new Date();
		await RegistryItems.insert({
			id: genIdAt(now),
			createdAt: now,
			updatedAt: now,
			userId: user.id,
			domain: null,
			scope: ps.scope,
			key: ps.key,
			value: ps.value,
		});
	}

	// TODO: サードパーティアプリが傍受出来てしまうのでどうにかする
	publishToMainStream(user.id, Event.Registry, {
		scope: ps.scope,
		key: ps.key,
		value: ps.value,
	});
});
