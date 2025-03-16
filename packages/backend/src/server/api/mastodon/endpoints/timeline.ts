import type Router from "@koa/router";
import type { ParsedUrlQuery } from "node:querystring";
import { TimelineHelpers } from "@/server/api/mastodon/helpers/timeline.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserLists } from "@/models/index.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { filterContext } from "@/server/api/mastodon/middleware/filter-context.js";

// TODO: Move helper functions to a helper class
export function limitToInt(q: ParsedUrlQuery, additional: string[] = []) {
	const object: any = q;
	if (q.limit)
		if (typeof q.limit === "string")
			object.limit = Number.parseInt(q.limit, 10);
	if (q.offset)
		if (typeof q.offset === "string")
			object.offset = Number.parseInt(q.offset, 10);
	for (const key of additional)
		if (typeof q[key] === "string")
			object[key] = Number.parseInt(<string>q[key], 10);
	return object;
}

export function argsToBools(q: ParsedUrlQuery, additional: string[] = []) {
	// Values taken from https://docs.joinmastodon.org/client/intro/#boolean
	const toBoolean = (value: string) =>
		!["0", "f", "F", "false", "FALSE", "off", "OFF"].includes(value);

	// Keys taken from:
	// - https://docs.joinmastodon.org/methods/accounts/#statuses
	// - https://docs.joinmastodon.org/methods/timelines/#public
	// - https://docs.joinmastodon.org/methods/timelines/#tag
	const keys = [
		"only_media",
		"exclude_replies",
		"exclude_reblogs",
		"pinned",
		"local",
		"remote",
	].concat(additional);
	const object: any = q;

	for (const key of keys)
		if (q[key] && typeof q[key] === "string")
			object[key] = toBoolean(<string>q[key]);

	return object;
}

export function normalizeUrlQuery(
	q: ParsedUrlQuery,
	arrayKeys: string[] = [],
): any {
	const dict: any = {};

	for (const k in q) {
		if (arrayKeys.includes(k)) dict[k] = Array.isArray(q[k]) ? q[k] : [q[k]];
		else dict[k] = Array.isArray(q[k]) ? q[k]?.at(-1) : q[k];
	}

	return dict;
}

export function setupEndpointsTimeline(router: Router): void {
	router.get(
		"/v1/timelines/public",
		auth(true, ["read:statuses"]),
		filterContext("public"),
		async (ctx, _reply) => {
			const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query)));
			const res = await TimelineHelpers.getPublicTimeline(
				args.max_id,
				args.since_id,
				args.min_id,
				args.limit,
				args.only_media,
				args.local,
				args.remote,
				ctx,
			);
			ctx.body = await NoteConverter.encodeMany(res, ctx);
		},
	);

	router.get<{ Params: { hashtag: string } }>(
		"/v1/timelines/tag/:hashtag",
		auth(false, ["read:statuses"]),
		filterContext("public"),
		async (ctx, _reply) => {
			const tag = (ctx.params.hashtag ?? "").trim().toLowerCase();
			const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query)), [
				"any[]",
				"all[]",
				"none[]",
			]);
			const res = await TimelineHelpers.getTagTimeline(
				tag,
				args.max_id,
				args.since_id,
				args.min_id,
				args.limit,
				args["any[]"] ?? [],
				args["all[]"] ?? [],
				args["none[]"] ?? [],
				args.only_media,
				args.local,
				args.remote,
				ctx,
			);
			ctx.body = await NoteConverter.encodeMany(res, ctx);
		},
	);

	router.get(
		"/v1/timelines/home",
		auth(true, ["read:statuses"]),
		filterContext("home"),
		async (ctx, _reply) => {
			const args = normalizeUrlQuery(limitToInt(ctx.query));
			const res = await TimelineHelpers.getHomeTimeline(
				args.max_id,
				args.since_id,
				args.min_id,
				args.limit,
				ctx,
			);
			ctx.body = await NoteConverter.encodeMany(res, ctx);
		},
	);

	router.get<{ Params: { listId: string } }>(
		"/v1/timelines/list/:listId",
		auth(true, ["read:lists"]),
		filterContext("home"),
		async (ctx, _reply) => {
			const list = await UserLists.findOneBy({
				userId: ctx.user.id,
				id: ctx.params.listId,
			});
			if (!list) throw new MastoApiError(404);

			const args = normalizeUrlQuery(limitToInt(ctx.query));
			const res = await TimelineHelpers.getListTimeline(
				list,
				args.max_id,
				args.since_id,
				args.min_id,
				args.limit,
				ctx,
			);
			ctx.body = await NoteConverter.encodeMany(res, ctx);
		},
	);

	router.get(
		"/v1/conversations",
		auth(true, ["read:statuses"]),
		async (ctx, _reply) => {
			const args = normalizeUrlQuery(limitToInt(ctx.query));
			ctx.body = await TimelineHelpers.getConversations(
				args.max_id,
				args.since_id,
				args.min_id,
				args.limit,
				ctx,
			);
		},
	);

	router.get(
		"/v1/markers",
		auth(true, ["read:statuses"]),
		async (ctx, _reply) => {
			const args = normalizeUrlQuery(ctx.query, ["timeline[]"]);
			ctx.body = await TimelineHelpers.getMarkers(args["timeline[]"], ctx);
		},
	);

	router.post(
		"/v1/markers",
		auth(true, ["write:statuses"]),
		async (ctx, _reply) => {
			const body = ctx.request.body;
			ctx.body = await TimelineHelpers.setMarkers(body, ctx);
		},
	);
}
