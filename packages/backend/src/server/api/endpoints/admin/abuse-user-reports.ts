import define from "@/server/api/define.js";
import { AbuseUserReports } from "@/models/index.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireModerator: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "AbuseUserReport",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		state: { type: "string", nullable: true, default: null },
		reporterOrigin: {
			type: "string",
			enum: ["combined", "local", "remote"],
			default: "combined",
		},
		targetUserOrigin: {
			type: "string",
			enum: ["combined", "local", "remote"],
			default: "combined",
		},
		forwarded: { type: "boolean", default: false },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps) => {
	const query = makePaginationQuery(
		AbuseUserReports.createQueryBuilder("report"),
		ps.sinceId,
		ps.untilId,
	);

	switch (ps.state) {
		case "resolved":
			query.andWhere("report.resolved = TRUE");
			break;
		case "unresolved":
			query.andWhere("report.resolved = FALSE");
			break;
	}

	switch (ps.reporterOrigin) {
		case "local":
			query.andWhere("report.reporterHost IS NULL");
			break;
		case "remote":
			query.andWhere("report.reporterHost IS NOT NULL");
			break;
	}

	switch (ps.targetUserOrigin) {
		case "local":
			query.andWhere("report.targetUserHost IS NULL");
			break;
		case "remote":
			query.andWhere("report.targetUserHost IS NOT NULL");
			break;
	}

	const reports = await query.take(ps.limit).getMany();

	return await AbuseUserReports.packMany(reports);
});
