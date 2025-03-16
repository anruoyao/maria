import { ModerationLogs } from "@/models/index.js";
import { genIdAt } from "backend-rs";
import type { User } from "@/models/entities/user.js";

export async function insertModerationLog(
	moderator: { id: User["id"] },
	type: string,
	info?: Record<string, any>,
) {
	const now = new Date();
	await ModerationLogs.insert({
		id: genIdAt(now),
		createdAt: now,
		userId: moderator.id,
		type: type,
		info: info || {},
	});
}
