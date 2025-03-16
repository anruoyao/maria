import * as os from "node:os";
import define from "@/server/api/define.js";
import { redisClient } from "@/db/redis.js";
import { db } from "@/db/postgre.js";
import { cpuInfo, memoryUsage, storageUsage } from "backend-rs";

export const meta = {
	requireCredential: true,
	requireModerator: true,

	tags: ["admin", "meta"],

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			machine: {
				type: "string",
				optional: false,
				nullable: false,
			},
			os: {
				type: "string",
				optional: false,
				nullable: false,
				example: "linux",
			},
			node: {
				type: "string",
				optional: false,
				nullable: false,
			},
			psql: {
				type: "string",
				optional: false,
				nullable: false,
			},
			cpu: {
				type: "object",
				optional: false,
				nullable: false,
				properties: {
					model: {
						type: "string",
						optional: false,
						nullable: false,
					},
					cores: {
						type: "number",
						optional: false,
						nullable: false,
					},
				},
			},
			mem: {
				type: "object",
				optional: false,
				nullable: false,
				properties: {
					total: {
						type: "number",
						optional: false,
						nullable: false,
						format: "bytes",
					},
				},
			},
			fs: {
				type: "object",
				optional: false,
				nullable: false,
				properties: {
					total: {
						type: "number",
						optional: false,
						nullable: false,
						format: "bytes",
					},
					used: {
						type: "number",
						optional: false,
						nullable: false,
						format: "bytes",
					},
				},
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
	const redisServerInfo = await redisClient.info("Server");
	const m = redisServerInfo.match(/^redis_version:(.*)/m);
	const redis_version = m?.[1];
	const storage = storageUsage();

	return {
		machine: os.hostname(),
		os: os.platform(),
		node: process.version,
		psql: await db
			.query("SHOW server_version")
			.then((x) => x[0].server_version),
		redis: redis_version,
		cpu: cpuInfo(),
		mem: {
			total: memoryUsage().total,
		},
		fs: {
			total: storage?.total ?? 0,
			used: storage?.used ?? 0,
		},
	};
});
