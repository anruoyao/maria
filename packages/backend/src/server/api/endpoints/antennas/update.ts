import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { Antennas, UserLists, UserGroupJoinings } from "@/models/index.js";
import {
	InternalEvent,
	publishToInternalStream,
	updateAntennaCache,
} from "backend-rs";

export const meta = {
	tags: ["antennas"],

	requireCredential: true,

	kind: "write:account",

	errors: {
		noSuchAntenna: {
			message: "No such antenna.",
			code: "NO_SUCH_ANTENNA",
			id: "10c673ac-8852-48eb-aa1f-f5b67f069290",
		},

		noSuchUserList: {
			message: "No such user list.",
			code: "NO_SUCH_USER_LIST",
			id: "1c6b35c9-943e-48c2-81e4-2844989407f7",
		},

		noSuchUserGroup: {
			message: "No such user group.",
			code: "NO_SUCH_USER_GROUP",
			id: "109ed789-b6eb-456e-b8a9-6059d567d385",
		},
	},

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Antenna",
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		antennaId: { type: "string", format: "misskey:id" },
		name: { type: "string", minLength: 1, maxLength: 100 },
		src: {
			type: "string",
			enum: ["home", "all", "users", "list", "group", "instances"],
		},
		userListId: { type: "string", format: "misskey:id", nullable: true },
		userGroupId: { type: "string", format: "misskey:id", nullable: true },
		keywords: {
			type: "array",
			items: {
				type: "array",
				items: {
					type: "string",
				},
			},
		},
		excludeKeywords: {
			type: "array",
			items: {
				type: "array",
				items: {
					type: "string",
				},
			},
		},
		users: {
			type: "array",
			items: {
				type: "string",
			},
		},
		instances: {
			type: "array",
			items: {
				type: "string",
			},
		},
		caseSensitive: { type: "boolean" },
		withReplies: { type: "boolean" },
		withFile: { type: "boolean" },
		notify: { type: "boolean" },
	},
	required: [
		"antennaId",
		"name",
		"src",
		"keywords",
		"excludeKeywords",
		"users",
		"instances",
		"caseSensitive",
		"withReplies",
		"withFile",
		"notify",
	],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const flatten = (arr: string[][]) =>
		JSON.stringify(arr) === "[[]]"
			? ([] as string[])
			: arr.map((row) => row.join(" "));

	const keywords = flatten(
		ps.keywords.map((row) => row.filter((word) => word.trim().length > 0)),
	);
	const excludedWords = flatten(
		ps.excludeKeywords.map((row) =>
			row.filter((word) => word.trim().length > 0),
		),
	);

	// Fetch the antenna
	const antenna = await Antennas.findOneBy({
		id: ps.antennaId,
		userId: user.id,
	});

	if (antenna == null) {
		throw new ApiError(meta.errors.noSuchAntenna);
	}

	let userList;
	let userGroupJoining;

	if (ps.src === "list" && ps.userListId) {
		userList = await UserLists.findOneBy({
			id: ps.userListId,
			userId: user.id,
		});

		if (userList == null) {
			throw new ApiError(meta.errors.noSuchUserList);
		}
	} else if (ps.src === "group" && ps.userGroupId) {
		userGroupJoining = await UserGroupJoinings.findOneBy({
			userGroupId: ps.userGroupId,
			userId: user.id,
		});

		if (userGroupJoining == null) {
			throw new ApiError(meta.errors.noSuchUserGroup);
		}
	}

	await Antennas.update(antenna.id, {
		name: ps.name,
		src: ps.src,
		userListId: userList ? userList.id : null,
		userGroupJoiningId: userGroupJoining ? userGroupJoining.id : null,
		keywords: keywords,
		excludeKeywords: excludedWords,
		users: ps.users,
		instances: ps.instances.filter((instance) => instance.trim().length > 0),
		caseSensitive: ps.caseSensitive,
		withReplies: ps.withReplies,
		withFile: ps.withFile,
		notify: ps.notify,
	});

	await publishToInternalStream(
		InternalEvent.AntennaUpdated,
		await Antennas.findOneByOrFail({ id: antenna.id }),
	);
	await updateAntennaCache();

	return await Antennas.pack(antenna.id);
});
