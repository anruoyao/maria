import {
	renderActivity,
	attachLdSignature,
} from "@/remote/activitypub/renderer/index.js";
import { renderUndo } from "@/remote/activitypub/renderer/undo.js";
import { deliver } from "@/queue/index.js";
import type { User } from "@/models/entities/user.js";
import { Relays } from "@/models/index.js";
import { getRelayActorId, genId, renderFollowRelay } from "backend-rs";
import { Cache } from "@/misc/cache.js";
import type { Relay } from "@/models/entities/relay.js";

const relaysCache = new Cache<Relay[]>("relay", 60 * 60);

export async function addRelay(inbox: string) {
	const relay = await Relays.insert({
		id: genId(),
		inbox,
		status: "requesting",
	}).then((x) => Relays.findOneByOrFail(x.identifiers[0]));

	const relayActorId = await getRelayActorId();
	const follow = await renderFollowRelay(relay.id);
	const activity = renderActivity(follow);
	deliver(relayActorId, activity, relay.inbox);

	return relay;
}

export async function removeRelay(inbox: string) {
	const relay = await Relays.findOneBy({
		inbox,
	});

	if (relay == null) {
		throw new Error("relay not found");
	}

	const relayActorId = await getRelayActorId();
	const follow = await renderFollowRelay(relay.id);
	const undo = renderUndo(follow, relayActorId);
	const activity = renderActivity(undo);
	deliver(relayActorId, activity, relay.inbox);

	await Relays.delete(relay.id);
	await updateRelaysCache();
}

export async function listRelay() {
	const relays = await Relays.find();
	return relays;
}

export async function getCachedRelays(): Promise<Relay[]> {
	return await relaysCache.fetch(null, () =>
		Relays.findBy({
			status: "accepted",
		}),
	);
}

export async function relayAccepted(id: string) {
	const result = await Relays.update(id, {
		status: "accepted",
	});

	await updateRelaysCache();

	return JSON.stringify(result);
}

async function updateRelaysCache() {
	const relays = await Relays.findBy({
		status: "accepted",
	});
	await relaysCache.set(null, relays);
}

export async function relayRejected(id: string) {
	const result = await Relays.update(id, {
		status: "rejected",
	});

	return JSON.stringify(result);
}

export async function deliverToRelays(
	user: { id: User["id"]; host: null },
	activity: any,
) {
	if (activity == null) return;

	const relays = await getCachedRelays();
	if (relays.length === 0) return;

	// TODO
	//const copy = structuredClone(activity);
	const copy = JSON.parse(JSON.stringify(activity));
	if (!copy.to) copy.to = ["https://www.w3.org/ns/activitystreams#Public"];

	const signed = await attachLdSignature(copy, user);

	for (const relay of relays) {
		deliver(user.id, signed, relay.inbox);
	}
}
