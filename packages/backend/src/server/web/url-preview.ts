import type Koa from "koa";
import summaly from "summaly";
import { fetchMeta } from "backend-rs";
import Logger from "@/services/logger.js";
import { config } from "@/config.js";
import { query } from "@/prelude/url.js";
import { getJson } from "@/misc/fetch.js";
import { inspect } from "node:util";

const logger = new Logger("url-preview");

export const urlPreviewHandler = async (ctx: Koa.Context) => {
	const url = ctx.query.url;
	if (typeof url !== "string") {
		ctx.status = 400;
		return;
	}

	const lang = ctx.query.lang;
	if (Array.isArray(lang)) {
		ctx.status = 400;
		return;
	}

	const instanceMeta = await fetchMeta();

	logger.info(
		instanceMeta.summalyProxy
			? `(Proxy) Getting preview of ${url}@${lang} ...`
			: `Getting preview of ${url}@${lang} ...`,
	);

	try {
		const summary = instanceMeta.summalyProxy
			? await getJson(
					`${instanceMeta.summalyProxy}?${query({
						url: url,
						lang: lang ?? "en-US",
					})}`,
				)
			: await summaly.default(url, {
					followRedirects: false,
					lang: lang ?? "en-US",
				});

		logger.info(`Got preview of ${url}: ${summary.title}`);

		if (
			summary.url &&
			!(summary.url.startsWith("http://") || summary.url.startsWith("https://"))
		) {
			throw new Error("unsupported schema included");
		}

		if (
			summary.player?.url &&
			!(
				summary.player.url.startsWith("http://") ||
				summary.player.url.startsWith("https://")
			)
		) {
			throw new Error("unsupported schema included");
		}

		summary.icon = wrap(summary.icon);
		summary.thumbnail = wrap(summary.thumbnail);

		// Cache 7days
		ctx.set("Cache-Control", "max-age=604800, immutable");

		ctx.body = summary;
	} catch (err) {
		logger.warn(`Failed to get preview of ${url}:\n${inspect(err)}`);
		ctx.status = 200;
		ctx.set("Cache-Control", "max-age=86400, immutable");
		ctx.body = "{}";
	}
};

function wrap(url?: string): string | null {
	return url != null
		? url.match(/^https?:\/\//)
			? `${config.url}/proxy/preview.webp?${query({
					url,
					preview: "1",
				})}`
			: url
		: null;
}
