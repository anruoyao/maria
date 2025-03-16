import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { Event, genIdAt, publishToMainStream } from "backend-rs";
import { AnnouncementReads, Announcements, Users } from "@/models/index.js";

export const meta = {
	tags: ["account"],

	requireCredential: true,

	kind: "write:account",

	errors: {
		noSuchAnnouncement: {
			message: "No such announcement.",
			code: "NO_SUCH_ANNOUNCEMENT",
			id: "184663db-df88-4bc2-8b52-fb85f0681939",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		announcementId: { type: "string", format: "misskey:id" },
	},
	required: ["announcementId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	// Check if announcement exists
	const exists = await Announcements.existsBy({
		id: ps.announcementId,
	});

	if (!exists) {
		throw new ApiError(meta.errors.noSuchAnnouncement);
	}

	// Check if already read
	const read = await AnnouncementReads.existsBy({
		announcementId: ps.announcementId,
		userId: user.id,
	});

	if (read) {
		return;
	}

	const now = new Date();

	// Create read
	await AnnouncementReads.insert({
		id: genIdAt(now),
		createdAt: now,
		announcementId: ps.announcementId,
		userId: user.id,
	});

	if (!(await Users.getHasUnreadAnnouncement(user.id))) {
		publishToMainStream(user.id, Event.ReadAllAnnouncements, {});
	}
});
