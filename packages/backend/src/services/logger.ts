import cluster from "node:cluster";
import chalk from "chalk";
import { default as convertColor } from "color-convert";
import { format as dateFormat } from "date-fns";
import { config } from "@/config.js";

import * as SyslogPro from "syslog-pro";

type Domain = {
	name: string;
	color?: string;
};

type Level = "error" | "warning" | "debug" | "info" | "trace";

export default class Logger {
	private domain: Domain;
	private parentLogger: Logger | null = null;
	private store: boolean;
	private syslogClient: any | null = null;

	constructor(domain: string, color?: string, store = true) {
		this.domain = {
			name: domain,
			color: color,
		};
		this.store = store;

		if (config.syslog) {
			this.syslogClient = new SyslogPro.RFC5424({
				applicationName: "Firefish",
				timestamp: true,
				includeStructuredData: true,
				color: true,
				extendedColor: true,
				server: {
					target: config.syslog.host,
					port: config.syslog.port,
				},
			});
		}
	}

	public createSubLogger(domain: string, color?: string, store = true): Logger {
		const logger = new Logger(domain, color, store);
		logger.parentLogger = this;
		return logger;
	}

	private showThisLog(logLevel: Level, configMaxLevel: string) {
		switch (configMaxLevel) {
			case "error":
				return ["error"].includes(logLevel);
			case "warning":
				return ["error", "warning"].includes(logLevel);
			case "info":
				return ["error", "warning", "info"].includes(logLevel);
			case "debug":
				return ["error", "warning", "info", "debug"].includes(logLevel);
			case "trace":
				return true;
			default:
				return ["error", "warning", "info"].includes(logLevel);
		}
	}

	private log(
		level: Level,
		message: string,
		data?: Record<string, any> | null,
		important = false,
		subDomains: Domain[] = [],
		store = true,
	): void {
		if (
			(config.maxLogLevel != null &&
				!this.showThisLog(level, config.maxLogLevel)) ||
			(config.logLevel != null && !config.logLevel.includes(level)) ||
			(config.maxLogLevel == null &&
				config.logLevel == null &&
				!this.showThisLog(level, "info"))
		)
			return;
		if (!this.store) store = false;
		if (level === "debug" || level === "trace") store = false;

		if (this.parentLogger) {
			this.parentLogger.log(
				level,
				message,
				data,
				important,
				[this.domain].concat(subDomains),
				store,
			);
			return;
		}

		const time = dateFormat(new Date(), "HH:mm:ss");
		const worker = cluster.isPrimary ? "*" : cluster.worker.id;
		const l =
			level === "error"
				? important
					? chalk.bgRed.white("ERROR")
					: chalk.red("ERROR")
				: level === "warning"
					? chalk.yellow(" WARN")
					: level === "info"
						? chalk.green(" INFO")
						: level === "debug"
							? chalk.blue("DEBUG")
							: level === "trace"
								? chalk.magenta("TRACE")
								: null;
		const domains = [this.domain]
			.concat(subDomains)
			.map((d) =>
				d.color
					? chalk.rgb(...convertColor.keyword.rgb(d.color))(d.name)
					: chalk.white(d.name),
			);
		const m =
			level === "error"
				? chalk.red(message)
				: level === "warning"
					? chalk.yellow(message)
					: level === "info"
						? chalk.green(message)
						: level === "debug"
							? chalk.blue(message)
							: level === "trace"
								? message
								: null;

		const log = `${l} ${worker}\t[${domains.join(" ")}]\t${m}`;

		console.log(important ? chalk.bold(log) : log);

		if (level === "error" && data != null) {
			console.log(data);
		}

		if (store) {
			if (this.syslogClient) {
				const send =
					level === "error"
						? this.syslogClient.error
						: level === "warning"
							? this.syslogClient.warning
							: level === "debug"
								? this.syslogClient.info
								: level === "info"
									? this.syslogClient.info
									: level === "trace"
										? this.syslogClient.info
										: (null as never);

				send
					.bind(this.syslogClient)(message)
					.catch(() => {});
			}
		}
	}

	// Only used when the process can't continue (fatal error)
	public error(
		x: string | Error,
		data?: Record<string, any> | null,
		important = false,
	): void {
		if (x instanceof Error) {
			data = data || {};
			data.e = x;
			this.log("error", x.toString(), data, important);
		} else if (typeof x === "object") {
			this.log(
				"error",
				`${(x as any).message || (x as any).name || x}`,
				data,
				important,
			);
		} else {
			this.log("error", `${x}`, data, important);
		}
	}

	// Used when the process can continue but some action should be taken
	public warn(
		message: string,
		data?: Record<string, any> | null,
		important = false,
	): void {
		this.log("warning", message, data, important);
	}

	// Other generic logs
	public info(
		message: string,
		data?: Record<string, any> | null,
		important = false,
	): void {
		this.log("info", message, data, important);
	}

	// Only used for debugging (information necessary for developers but unnecessary for users)
	public debug(
		message: string,
		data?: Record<string, any> | null,
		important = false,
	): void {
		// Fixed if statement is ignored when logLevel includes debug
		if (
			config.logLevel?.includes("debug") ||
			process.env.NODE_ENV !== "production"
		) {
			this.log("debug", message, data, important);
		}
	}

	// Extremely verbose logs for debugging (e.g., SQL Query)
	public trace(
		message: string,
		data?: Record<string, any> | null,
		important = false,
	): void {
		this.log("trace", message, data, important);
	}
}
