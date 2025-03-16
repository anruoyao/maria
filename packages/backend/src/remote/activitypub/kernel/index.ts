import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { toArray } from "@/prelude/array.js";
import {
	isCreate,
	isDelete,
	isUpdate,
	isRead,
	isFollow,
	isAccept,
	isReject,
	isAdd,
	isRemove,
	isAnnounce,
	isLike,
	isUndo,
	isBlock,
	isCollectionOrOrderedCollection,
	isCollection,
	isFlag,
	isMove,
	getApId,
} from "../type.js";
import { apLogger } from "../logger.js";
import Resolver from "../resolver.js";
import create from "./create/index.js";
import performDeleteActivity from "./delete/index.js";
import performUpdateActivity from "./update/index.js";
import { performReadActivity } from "./read.js";
import follow from "./follow.js";
import undo from "./undo/index.js";
import like from "./like.js";
import announce from "./announce/index.js";
import accept from "./accept/index.js";
import reject from "./reject/index.js";
import add from "./add/index.js";
import remove from "./remove/index.js";
import block from "./block/index.js";
import flag from "./flag/index.js";
import move from "./move/index.js";
import type { IObject, IActivity } from "../type.js";
import { extractHost, isBlockedServer } from "backend-rs";
import { inspect } from "node:util";

export async function performActivity(
	actor: CacheableRemoteUser,
	activity: IObject,
) {
	if (isCollectionOrOrderedCollection(activity)) {
		apLogger.debug("Refusing to ingest collection as activity");
		return;
	} else {
		await performOneActivity(actor, activity);
	}
}

async function performOneActivity(
	actor: CacheableRemoteUser,
	activity: IObject,
): Promise<void> {
	if (actor.isSuspended) return;

	if (typeof activity.id !== "undefined") {
		const host = extractHost(getApId(activity));
		if (await isBlockedServer(host)) return;
	}

	if (isCreate(activity)) {
		await create(actor, activity);
	} else if (isDelete(activity)) {
		await performDeleteActivity(actor, activity);
	} else if (isUpdate(activity)) {
		await performUpdateActivity(actor, activity);
	} else if (isRead(activity)) {
		await performReadActivity(actor, activity);
	} else if (isFollow(activity)) {
		await follow(actor, activity);
	} else if (isAccept(activity)) {
		await accept(actor, activity);
	} else if (isReject(activity)) {
		await reject(actor, activity);
	} else if (isAdd(activity)) {
		await add(actor, activity).catch((err) => {
			apLogger.warn(`Failed to perform 'add' activity: ${err}`);
			apLogger.debug(inspect(err));
		});
	} else if (isRemove(activity)) {
		await remove(actor, activity).catch((err) => {
			apLogger.warn(`Failed to perform 'remove' activity: ${err}`);
			apLogger.debug(inspect(err));
		});
	} else if (isAnnounce(activity)) {
		await announce(actor, activity);
	} else if (isLike(activity)) {
		await like(actor, activity);
	} else if (isUndo(activity)) {
		await undo(actor, activity);
	} else if (isBlock(activity)) {
		await block(actor, activity);
	} else if (isFlag(activity)) {
		await flag(actor, activity);
	} else if (isMove(activity)) {
		await move(actor, activity);
	} else {
		apLogger.info(
			`Unrecognized activity type: ${(activity as IActivity).type}`,
		);
	}
}
