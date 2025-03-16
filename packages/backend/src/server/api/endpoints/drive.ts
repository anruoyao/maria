import { fetchMeta } from "backend-rs";
import { DriveFiles } from "@/models/index.js";
import define from "@/server/api/define.js";

export const meta = {
	tags: ["drive", "account"],

	requireCredential: true,

	kind: "read:drive",

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			capacity: {
				type: "number",
				optional: false,
				nullable: false,
			},
			usage: {
				type: "number",
				optional: false,
				nullable: false,
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const instanceMeta = await fetchMeta();

	// Calculate drive usage
	const usage = await DriveFiles.calcDriveUsageOf(user.id);

	return {
		capacity:
			1024 *
			1024 *
			(user.driveCapacityOverrideMb || instanceMeta.localDriveCapacityMb),
		usage: usage,
	};
});
