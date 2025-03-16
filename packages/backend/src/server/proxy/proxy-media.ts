import * as fs from "node:fs";
import type Koa from "koa";
import sharp from "sharp";
import type { IImage } from "@/services/drive/image-processor.js";
import { convertToWebp } from "@/services/drive/image-processor.js";
import { createTemp } from "@/misc/create-temp.js";
import { downloadUrl } from "@/misc/download-url.js";
import { detectType } from "@/misc/get-file-info.js";
import { StatusError } from "@/misc/fetch.js";
import { FILE_TYPE_BROWSERSAFE, MINUTE } from "@/const.js";
import { serverLogger } from "../index.js";
import { isMimeImage } from "@/misc/is-mime-image.js";
import { inspect } from "node:util";
import type { IEndpointMeta } from "@/server/api/endpoints.js";
import { getIpHash } from "@/misc/get-ip-hash.js";
import { limiter } from "@/server/api/limiter.js";

export async function proxyMedia(ctx: Koa.Context) {
	const url = "url" in ctx.query ? ctx.query.url : `https://${ctx.params.url}`;

	if (typeof url !== "string") {
		ctx.status = 400;
		return;
	}

	// koa will automatically load the `X-Forwarded-For` header if `proxy: true` is configured in the app.
	const limitActor = getIpHash(ctx.ip);

	const parsedUrl = new URL(url);

	const limit: IEndpointMeta["limit"] = {
		key: `media-proxy:${parsedUrl.host}:${parsedUrl.pathname}`,
		duration: MINUTE * 10,
		max: 10,
	};

	// Rate limit
	await limiter(
		limit as IEndpointMeta["limit"] & { key: NonNullable<string> },
		limitActor,
	).catch((e) => {
		const remainingTime = e.remainingTime
			? `Please try again in ${e.remainingTime}.`
			: "Please try again later.";

		ctx.status = 429;
		ctx.body = "Rate limit exceeded. " + remainingTime;
	});

	if (ctx.status === 429) return;

	if (ctx.headers["user-agent"]) {
		const userAgent = ctx.headers["user-agent"].toLowerCase();
		if (
			["misskey/", "firefish/", "iceshrimp/", "cherrypick/"].some((s) =>
				userAgent.includes(s),
			)
		) {
			ctx.status = 403;
			ctx.message = "Proxy is recursive";
			return;
		}
	} else {
		ctx.status = 400;
		ctx.message = "User-Agent is required";
		return;
	}

	// Create temp file
	const [path, cleanup] = await createTemp();

	try {
		await downloadUrl(url, path);

		const { mime, ext } = await detectType(path);
		const isConvertibleImage = isMimeImage(mime, "sharp-convertible-image");

		let image: IImage;

		if ("static" in ctx.query && isConvertibleImage) {
			image = await convertToWebp(path, 996, 560);
		} else if ("preview" in ctx.query && isConvertibleImage) {
			image = await convertToWebp(path, 400, 400);
		} else if ("badge" in ctx.query) {
			if (!isConvertibleImage) {
				// 画像でないなら404でお茶を濁す
				throw new StatusError("Unexpected mime", 404);
			}

			const mask = sharp(path)
				.resize(96, 96, {
					fit: "inside",
					withoutEnlargement: false,
				})
				.greyscale()
				.normalise()
				.linear(1.75, -(128 * 1.75) + 128) // 1.75x contrast
				.flatten({ background: "#000" })
				.toColorspace("b-w");

			const stats = await mask.clone().stats();

			if (stats.entropy < 0.1) {
				// エントロピーがあまりない場合は404にする
				throw new StatusError("Skip to provide badge", 404);
			}

			const data = sharp({
				create: {
					width: 96,
					height: 96,
					channels: 4,
					background: { r: 0, g: 0, b: 0, alpha: 0 },
				},
			})
				.pipelineColorspace("b-w")
				.boolean(await mask.png().toBuffer(), "eor");

			image = {
				data: await data.png().toBuffer(),
				ext: "png",
				type: "image/png",
			};
		} else if (mime === "image/svg+xml") {
			image = await convertToWebp(path, 2048, 2048, 1);
		} else if (
			!(mime.startsWith("image/") && FILE_TYPE_BROWSERSAFE.includes(mime))
		) {
			throw new StatusError("Rejected type", 403, "Rejected type");
		} else {
			image = {
				data: fs.readFileSync(path),
				ext,
				type: mime,
			};
		}

		ctx.set("Content-Type", image.type);
		ctx.set("Cache-Control", "max-age=31536000, immutable");
		ctx.body = image.data;
	} catch (e) {
		serverLogger.warn(`failed to proxy ${url}`);
		serverLogger.debug(inspect(e));

		if (e instanceof StatusError && (e.statusCode === 302 || e.isClientError)) {
			ctx.status = e.statusCode;
		} else {
			ctx.status = 500;
		}
	} finally {
		cleanup();
	}
}
