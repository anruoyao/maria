import { beforeShutdown } from "@/misc/before-shutdown.js";
import ActiveUsersChart from "./charts/active-users.js";

export const activeUsersChart = new ActiveUsersChart();

setInterval(() => activeUsersChart.save(), 1000 * 60 * 20);
beforeShutdown(() => activeUsersChart.save());
