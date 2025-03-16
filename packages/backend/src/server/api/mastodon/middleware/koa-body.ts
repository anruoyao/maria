import type { Middleware } from "@koa/router";
import { HttpMethodEnum, koaBody } from "koa-body";

export function KoaBodyMiddleware(): Middleware {
	const options = {
		multipart: true,
		urlencoded: true,
		parsedMethods: [
			HttpMethodEnum.POST,
			HttpMethodEnum.PUT,
			HttpMethodEnum.PATCH,
			HttpMethodEnum.DELETE,
		],
	};

	return koaBody(options);
}
