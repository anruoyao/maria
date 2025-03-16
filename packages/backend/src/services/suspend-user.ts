import renderDelete from "@/remote/activitypub/renderer/delete.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { deliver } from "@/queue/index.js";
import { config } from "@/config.js";
import type { User } from "@/models/entities/user.js";
import { Users, Followings } from "@/models/index.js";
import { Not, IsNull } from "typeorm";
import { InternalEvent, publishToInternalStream } from "backend-rs";

export async function doPostSuspend(user: {
	id: User["id"];
	host: User["host"];
}) {
	await publishToInternalStream(InternalEvent.Suspend, {
		id: user.id,
		isSuspended: true,
	});

	if (Users.isLocalUser(user)) {
		// Send Delete to all known SharedInboxes
		const content = renderActivity(
			renderDelete(`${config.url}/users/${user.id}`, user),
		);

		const queue: string[] = [];

		const followings = await Followings.find({
			where: [
				{ followerSharedInbox: Not(IsNull()) },
				{ followeeSharedInbox: Not(IsNull()) },
			],
			select: ["followerSharedInbox", "followeeSharedInbox"],
		});

		const inboxes = followings.map(
			(x) => x.followerSharedInbox || x.followeeSharedInbox,
		);

		for (const inbox of inboxes) {
			if (inbox != null && !queue.includes(inbox)) queue.push(inbox);
		}

		for (const inbox of queue) {
			deliver(user.id, content, inbox);
		}
	}
}
