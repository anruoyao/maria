import { Users } from "@/models/index.js";
import { createDeleteAccountJob } from "@/queue/index.js";
import { publishToUserStream, UserEvent } from "backend-rs";
import { doPostSuspend } from "@/services/suspend-user.js";

export async function deleteAccount(user: {
	id: string;
	host: string | null;
}): Promise<void> {
	// 物理削除する前にDelete activityを送信する
	await doPostSuspend(user).catch((e) => {});

	createDeleteAccountJob(user, {
		soft: false,
	});

	await Users.update(user.id, {
		isDeleted: true,
	});

	// Terminate streaming
	await publishToUserStream(user.id, UserEvent.Disconnect, {});
}
