import { Instances, Users, Notes } from "@/models/index.js";
import define from "@/server/api/define.js";
import { IsNull } from "typeorm";
import { countLocalUsers } from "backend-rs";

export const meta = {
	requireCredential: false,
	requireCredentialPrivateMode: true,

	tags: ["meta"],

	cacheSec: 600,

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			notesCount: {
				type: "number",
				optional: false,
				nullable: false,
			},
			originalNotesCount: {
				type: "number",
				optional: false,
				nullable: false,
			},
			usersCount: {
				type: "number",
				optional: false,
				nullable: false,
			},
			originalUsersCount: {
				type: "number",
				optional: false,
				nullable: false,
			},
			instances: {
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

export default define(meta, paramDef, async () => {
	const [
		notesCount,
		originalNotesCount,
		usersCount,
		originalUsersCount,
		instances,
	] = await Promise.all([
		// notesCount
		Notes.count(),
		// originalNotesCount
		Notes.count({
			where: {
				userHost: IsNull(),
			},
		}),
		// usersCount
		Users.count(),
		// originalUsersCount
		countLocalUsers(),
		// instances
		Instances.count(),
	]);

	return {
		notesCount,
		originalNotesCount,
		usersCount,
		originalUsersCount,
		instances,
	};
});
