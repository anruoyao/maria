import Router from "@koa/router";
import { config } from "@/config.js";
import { nodeinfo_2_0, nodeinfo_2_1 } from "backend-rs";
import { fromRustObject } from "@/prelude/undefined-to-null.js";

const router = new Router();

const nodeinfo2_1path = "/nodeinfo/2.1";
const nodeinfo2_0path = "/nodeinfo/2.0";

// to cleo: leave this http or bonks
export const links = [
	{
		rel: "http://nodeinfo.diaspora.software/ns/schema/2.1",
		href: config.url + nodeinfo2_1path,
	},
	{
		rel: "http://nodeinfo.diaspora.software/ns/schema/2.0",
		href: config.url + nodeinfo2_0path,
	},
];

router.get(nodeinfo2_1path, async (ctx) => {
	ctx.body = fromRustObject(await nodeinfo_2_1());
	ctx.set("Cache-Control", "public, max-age=3600");
});

router.get(nodeinfo2_0path, async (ctx) => {
	ctx.body = fromRustObject(await nodeinfo_2_0());
	ctx.set("Cache-Control", "public, max-age=3600");
});

export default router;
