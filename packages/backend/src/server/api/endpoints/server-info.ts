import * as os from "node:os";
import define from "@/server/api/define.js";
import { fetchMeta, cpuInfo, memoryUsage, storageUsage } from "backend-rs";

export const meta = {
	requireCredential: true,
	requireCredentialPrivateMode: true,
	allowGet: true,
	cacheSec: 30,
	tags: ["meta"],
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	const instanceMeta = await fetchMeta();

	if (!instanceMeta.enableServerMachineStats) {
		return {
			machine: "Not specified",
			cpu: {
				model: "Not specified",
				cores: 0,
			},
			mem: {
				total: 0,
			},
			fs: {
				total: 0,
				used: 0,
			},
		};
	}

	const memory = memoryUsage();
	const storage = storageUsage();

	return {
		machine: os.hostname(),
		cpu: cpuInfo(),
		mem: {
			total: memory.total,
		},
		fs: {
			total: storage?.total ?? 0,
			used: storage?.used ?? 0,
		},
	};
});
