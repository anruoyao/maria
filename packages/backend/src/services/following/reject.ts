import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { deliver, webhookDeliver } from "@/queue/index.js";
import {
	Event,
	publishToMainStream,
	publishToUserStream,
	UserEvent,
	renderFollow,
	renderReject,
} from "backend-rs";
import type { ILocalUser, IRemoteUser } from "@/models/entities/user.js";
import { Users, FollowRequests, Followings } from "@/models/index.js";
import { decrementFollowing } from "./delete.js";
import { getActiveWebhooks } from "@/misc/webhook-cache.js";

type Local =
	| ILocalUser
	| {
			id: ILocalUser["id"];
			host: ILocalUser["host"];
			uri: ILocalUser["uri"];
			username: ILocalUser["username"];
	  };
type Remote =
	| IRemoteUser
	| {
			id: IRemoteUser["id"];
			host: IRemoteUser["host"];
			uri: IRemoteUser["uri"];
			username: IRemoteUser["username"];
			inbox: IRemoteUser["inbox"];
	  };
type Both = Local | Remote;

/**
 * API following/request/reject
 */
export async function rejectFollowRequest(user: Local, follower: Both) {
	if (Users.isRemoteUser(follower)) {
		deliverReject(user, follower);
	}

	await removeFollowRequest(user, follower);

	if (Users.isLocalUser(follower)) {
		publishUnfollow(user, follower);
	}
}

/**
 * API following/reject
 */
export async function rejectFollow(user: Local, follower: Both) {
	if (Users.isRemoteUser(follower)) {
		deliverReject(user, follower);
	}

	await removeFollow(user, follower);

	if (Users.isLocalUser(follower)) {
		publishUnfollow(user, follower);
	}
}

/**
 * AP Reject/Follow
 */
export async function remoteReject(actor: Remote, follower: Local) {
	await removeFollowRequest(actor, follower);
	await removeFollow(actor, follower);
	publishUnfollow(actor, follower);
}

/**
 * Remove follow request record
 */
async function removeFollowRequest(followee: Both, follower: Both) {
	const request = await FollowRequests.findOneBy({
		followeeId: followee.id,
		followerId: follower.id,
	});

	if (!request) return;

	await FollowRequests.delete(request.id);
}

/**
 * Remove follow record
 */
async function removeFollow(followee: Both, follower: Both) {
	const following = await Followings.findOneBy({
		followeeId: followee.id,
		followerId: follower.id,
	});

	if (!following) return;

	await Followings.delete(following.id);
	decrementFollowing(follower, followee);
}

/**
 * Deliver Reject to remote
 */
async function deliverReject(followee: Local, follower: Remote) {
	const request = await FollowRequests.findOneBy({
		followeeId: followee.id,
		followerId: follower.id,
	});

	const content = renderActivity(
		renderReject(
			followee.id,
			renderFollow(follower, followee, request?.requestId || undefined),
		),
	);
	deliver(followee.id, content, follower.inbox);
}

/**
 * Publish unfollow to local
 */
async function publishUnfollow(followee: Both, follower: Local) {
	const packedFollowee = await Users.pack(followee.id, follower, {
		detail: true,
	});

	publishToUserStream(follower.id, UserEvent.Unfollow, packedFollowee);
	publishToMainStream(follower.id, Event.Unfollow, packedFollowee);

	const webhooks = (await getActiveWebhooks()).filter(
		(x) => x.userId === follower.id && x.on.includes("unfollow"),
	);
	for (const webhook of webhooks) {
		webhookDeliver(webhook, "unfollow", {
			user: packedFollowee,
		});
	}
}
