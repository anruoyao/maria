export const packedAbuseUserReportSchema = {
	type: "object",
	properties: {
		id: {
			type: "string",
			optional: false,
			nullable: false,
			format: "id",
			example: "xxxxxxxxxx",
		},
		createdAt: {
			type: "string",
			optional: false,
			nullable: false,
			format: "date-time",
		},
		comment: {
			type: "string",
			optional: false,
			nullable: false,
		},
		resolved: {
			type: "boolean",
			optional: false,
			nullable: false,
		},
		reporterId: {
			type: "string",
			optional: false,
			nullable: false,
			format: "id",
		},
		targetUserId: {
			type: "string",
			optional: false,
			nullable: false,
			format: "id",
		},
		assigneeId: {
			type: "string",
			optional: false,
			nullable: true,
			format: "id",
		},
		reporter: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "UserDetailed",
		},
		targetUser: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "UserDetailed",
		},
		assignee: {
			type: "object",
			optional: true,
			nullable: true,
			ref: "UserDetailed",
		},
		forwarded: {
			type: "boolean",
			optional: false,
			nullable: false,
		},
	},
} as const;
