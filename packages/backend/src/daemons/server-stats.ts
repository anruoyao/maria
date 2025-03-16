import Xev from "xev";
import { fetchMeta, cpuUsage, memoryUsage } from "backend-rs";

const ev = new Xev();

/**
 * Report server stats regularly
 */
export default async function () {
	const log = [] as any[];

	ev.on("requestServerStatsLog", (x) => {
		ev.emit(`serverStatsLog:${x.id}`, log.slice(0, x.length || 50));
	});

	const instanceMeta = await fetchMeta();
	if (!instanceMeta.enableServerMachineStats) return;

	async function tick() {
		const stats = {
			cpu: cpuUsage(),
			mem: memoryUsage(),
		};
		ev.emit("serverStats", stats);
		log.unshift(stats);
		if (log.length > 200) log.pop();
	}

	tick();

	setInterval(tick, 3000);
}
