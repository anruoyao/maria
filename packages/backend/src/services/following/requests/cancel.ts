import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { renderUndo } from "@/remote/activitypub/renderer/undo.js";
import { deliver } from "@/queue/index.js";
import { Event, publishToMainStream, renderFollow } from "backend-rs";
import { IdentifiableError } from "@/misc/identifiable-error.js";
import type { User } from "@/models/entities/user.js";
import { Users, FollowRequests } from "@/models/index.js";

export default async function (
	followee: {
		id: User["id"];
		host: User["host"];
		uri: User["host"];
		inbox: User["inbox"];
	},
	follower: { id: User["id"]; host: User["host"]; uri: User["host"] },
) {
	if (Users.isRemoteUser(followee)) {
		const content = renderActivity(
			renderUndo(renderFollow(follower, followee), follower.id),
		);

		if (Users.isLocalUser(follower)) {
			// 本来このチェックは不要だけどTSに怒られるので
			deliver(follower.id, content, followee.inbox);
		}
	}

	const request = await FollowRequests.findOneBy({
		followeeId: followee.id,
		followerId: follower.id,
	});

	if (request == null) {
		throw new IdentifiableError(
			"17447091-ce07-46dd-b331-c1fd4f15b1e7",
			"request not found",
		);
	}

	await FollowRequests.delete({
		followeeId: followee.id,
		followerId: follower.id,
	});

	Users.pack(followee.id, followee, {
		detail: true,
	}).then((packed) => publishToMainStream(followee.id, Event.Me, packed));
}
