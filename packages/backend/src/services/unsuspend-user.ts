import renderDelete from "@/remote/activitypub/renderer/delete.js";
import { renderUndo } from "@/remote/activitypub/renderer/undo.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { deliver } from "@/queue/index.js";
import { config } from "@/config.js";
import type { User } from "@/models/entities/user.js";
import { Users, Followings } from "@/models/index.js";
import { Not, IsNull } from "typeorm";
import { InternalEvent, publishToInternalStream } from "backend-rs";

export async function doPostUnsuspend(user: User) {
	publishToInternalStream(InternalEvent.Suspend, {
		id: user.id,
		isSuspended: false,
	});

	if (Users.isLocalUser(user)) {
		// 知り得る全SharedInboxにUndo Delete配信
		const content = renderActivity(
			renderUndo(renderDelete(`${config.url}/users/${user.id}`, user), user.id),
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
