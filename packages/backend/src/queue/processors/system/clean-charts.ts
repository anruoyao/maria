import type Bull from "bull";

import { queueLogger } from "../../logger.js";
import { activeUsersChart } from "@/services/chart/index.js";

const logger = queueLogger.createSubLogger("clean-charts");

export async function cleanCharts(
	job: Bull.Job<Record<string, unknown>>,
	done: any,
): Promise<void> {
	logger.info("Cleaning active users chart...");
	await activeUsersChart.clean();
	logger.info("Active users chart has been cleaned.");
	done();
}
