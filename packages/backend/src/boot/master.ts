import * as os from "node:os";
import cluster from "node:cluster";
import semver from "semver";

import Logger from "@/services/logger.js";
import {
	greet,
	removeOldAttestationChallenges,
	showServerInfo,
	type Config,
} from "backend-rs";
import { config } from "@/config.js";
import { db, initDb } from "@/db/postgre.js";
import { inspect } from "node:util";

const logger = new Logger("core", "cyan");
const bootLogger = logger.createSubLogger("boot", "magenta", false);

/**
 * Init master process
 */
export async function masterMain() {
	// initialize app
	try {
		greet();
		showServerInfo();
		showEnvironment();
		showNodejsVersion();
		await connectDb();
	} catch (e) {
		bootLogger.error(
			`Fatal error occurred during initialization:\n${inspect(e)}`,
			null,
			true,
		);
		process.exit(1);
	}

	bootLogger.info("Firefish initialized");

	await spawnWorkers(config.clusterLimits);

	bootLogger.info(
		`Now listening on port ${config.port} on ${config.url}`,
		null,
		true,
	);

	import("../daemons/server-stats.js").then((x) => x.default());
	import("../daemons/queue-stats.js").then((x) => x.default());
	// Remove old attestation challenges
	setInterval(() => removeOldAttestationChallenges(), 1000 * 60 * 30);
}

function showEnvironment(): void {
	const env = process.env.NODE_ENV;
	const logger = bootLogger.createSubLogger("env");
	logger.info(
		typeof env === "undefined" ? "NODE_ENV is not set" : `NODE_ENV: ${env}`,
	);

	if (env !== "production") {
		logger.warn("The environment is not in production mode.");
		logger.warn("DO NOT USE THIS IN PRODUCTION!", null, true);
	}
}

function showNodejsVersion(): void {
	const nodejsLogger = bootLogger.createSubLogger("nodejs");

	nodejsLogger.info(`Version ${process.version} detected.`);

	const minVersion = "v18.20.0";
	if (semver.lt(process.version, minVersion)) {
		nodejsLogger.error(`At least Node.js ${minVersion} required!`);
		process.exit(1);
	}
}

async function connectDb(): Promise<void> {
	const dbLogger = bootLogger.createSubLogger("db");

	// Try to connect to DB
	try {
		dbLogger.info("Connecting to the database...");
		await initDb();
		const v = await db
			.query("SHOW server_version")
			.then((x) => x[0].server_version);
		dbLogger.info(`Connected: v${v}`);
	} catch (e) {
		dbLogger.error("Failed to connect to the database", null, true);
		dbLogger.error(inspect(e));
		process.exit(1);
	}
}

async function spawnWorkers(
	clusterLimits: Config["clusterLimits"],
): Promise<void> {
	const cpus = os.cpus().length;

	if (clusterLimits.queue > cpus) {
		bootLogger.warn(
			"config: queue cluster limit exceeds the number of cpu cores",
		);
	}

	if (clusterLimits.web > cpus) {
		bootLogger.warn(
			"config: web cluster limit exceeds the number of cpu cores",
		);
	}

	const total = clusterLimits.queue + clusterLimits.web;

	// workers = ["web", "web", ..., "web", "queue", "queue", ..., "queue"]
	const workers = new Array(total);
	workers.fill("web", 0, clusterLimits.web);
	workers.fill("queue", clusterLimits.web);

	bootLogger.info(
		`Starting ${clusterLimits.web} web workers and ${clusterLimits.queue} queue workers (total ${total})...`,
	);
	await Promise.all(workers.map((mode) => spawnWorker(mode)));
	bootLogger.info("All workers started");
}

function spawnWorker(mode: "web" | "queue"): Promise<void> {
	return new Promise((res) => {
		const worker = cluster.fork({ mode });
		worker.on("message", (message) => {
			if (message === "listenFailed") {
				bootLogger.error("The server listen failed due to the previous error.");
				process.exit(1);
			}
			if (message !== "ready") return;
			res();
		});
	});
}
