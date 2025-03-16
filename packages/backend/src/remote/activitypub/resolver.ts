import { config } from "@/config.js";
import type { ILocalUser } from "@/models/entities/user.js";
import {
	extractHost,
	getInstanceActor,
	isAllowedServer,
	isBlockedServer,
	isSelfHost,
	renderFollow,
	renderLike,
} from "backend-rs";
import { apGet } from "./request.js";
import type { IObject, ICollection, IOrderedCollection } from "./type.js";
import { isCollectionOrOrderedCollection, getApId } from "./type.js";
import {
	FollowRequests,
	Notes,
	NoteReactions,
	Polls,
	Users,
} from "@/models/index.js";
import { parseUri } from "./db-resolver.js";
import renderNote from "@/remote/activitypub/renderer/note.js";
import { renderPerson } from "@/remote/activitypub/renderer/person.js";
import renderQuestion from "@/remote/activitypub/renderer/question.js";
import renderCreate from "@/remote/activitypub/renderer/create.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { apLogger } from "@/remote/activitypub/logger.js";
import { IsNull, Not } from "typeorm";

export default class Resolver {
	private history: Set<string>;
	private user?: ILocalUser;
	private recursionLimit?: number;

	constructor(recursionLimit = 100) {
		this.history = new Set();
		this.recursionLimit = recursionLimit;
	}

	public setUser(user) {
		this.user = user;
	}

	public reset(): Resolver {
		this.history = new Set();
		return this;
	}

	public getHistory(): string[] {
		return Array.from(this.history);
	}

	public async resolveCollection(
		value: string | IObject,
	): Promise<ICollection | IOrderedCollection> {
		const collection = await this.resolve(value);

		if (isCollectionOrOrderedCollection(collection)) {
			return collection;
		} else {
			throw new Error(`unrecognized collection type: ${collection.type}`);
		}
	}

	public async resolve(value: string | IObject): Promise<IObject> {
		if (value == null) {
			throw new Error("resolvee is null (or undefined)");
		}

		if (typeof value !== "string") {
			apLogger.debug("Object to resolve is not a string");
			if (typeof value.id !== "undefined") {
				const host = extractHost(getApId(value));
				if (await isBlockedServer(host)) {
					throw new Error("instance is blocked");
				}
			}
			apLogger.debug("Returning the existing object");
			apLogger.trace(JSON.stringify(value, null, 2));
			return value;
		}

		apLogger.info(`Resolving: ${value}`);

		if (value.includes("#")) {
			// URLs with fragment parts cannot be resolved correctly because
			// the fragment part does not get transmitted over HTTP(S).
			// Avoid strange behaviour by not trying to resolve these at all.
			throw new Error(`cannot resolve URL with fragment: ${value}`);
		}

		if (this.history.has(value)) {
			throw new Error("cannot resolve already resolved one");
		}
		if (this.recursionLimit && this.history.size > this.recursionLimit) {
			throw new Error("hit recursion limit");
		}
		this.history.add(value);

		const host = extractHost(value);
		if (isSelfHost(host)) {
			return await this.resolveLocal(value);
		}

		if (await isBlockedServer(host)) {
			throw new Error("This instance is blocked");
		}

		if (config.host !== host && !isAllowedServer(host)) {
			throw new Error("This instance is not allowed");
		}

		if (!this.user) {
			this.user = (await getInstanceActor()) as ILocalUser;
		}

		apLogger.info(
			`Getting object from remote, authenticated as user ${this.user.id}`,
		);
		apLogger.trace(JSON.stringify(this.user, null, 2));

		const { finalUrl, content: object } = await apGet(value, this.user);

		if (
			object == null ||
			(Array.isArray(object["@context"])
				? !(object["@context"] as unknown[]).includes(
						"https://www.w3.org/ns/activitystreams",
					)
				: object["@context"] !== "https://www.w3.org/ns/activitystreams")
		) {
			throw new Error("invalid response");
		}

		if (object.id == null) {
			throw new Error("Object has no ID");
		}

		const finalUrl_ = new URL(finalUrl);
		const objectId_ = new URL(object.id);

		if (finalUrl_.href === objectId_.href) return object;

		if (finalUrl_.host !== objectId_.host) {
			throw new Error("Object ID host doesn't match final url host");
		}

		const finalRes = await apGet(object.id, this.user);

		if (new URL(finalRes.finalUrl).href !== new URL(finalRes.content.id).href)
			throw new Error(
				"Object ID still doesn't match final URL after second fetch attempt",
			);

		return finalRes.content;
	}

	private async resolveLocal(url: string): Promise<IObject> {
		const parsed = parseUri(url);
		if (!parsed.local) throw new Error("resolveLocal: not local");

		switch (parsed.type) {
			case "notes": {
				const note = await Notes.findOneByOrFail({ id: parsed.id });
				if (parsed.rest === "activity") {
					// this refers to the create activity and not the note itself
					return renderActivity(renderCreate(renderNote(note), note));
				} else {
					return renderNote(note);
				}
			}
			case "users": {
				const user = await Users.findOneByOrFail({ id: parsed.id });
				return await renderPerson(user as ILocalUser);
			}
			case "questions": {
				// Polls are indexed by the note they are attached to.
				const [pollNote, poll] = await Promise.all([
					Notes.findOneByOrFail({ id: parsed.id }),
					Polls.findOneByOrFail({ noteId: parsed.id }),
				]);
				return await renderQuestion({ id: pollNote.userId }, pollNote, poll);
			}
			case "likes": {
				const reaction = await NoteReactions.findOneByOrFail({ id: parsed.id });
				return renderActivity(await renderLike(reaction));
			}
			case "follows": {
				// if rest is a <followee id>
				if (parsed.rest != null && /^\w+$/.test(parsed.rest)) {
					const [follower, followee] = await Promise.all(
						[parsed.id, parsed.rest].map((id) => Users.findOneByOrFail({ id })),
					);
					return renderActivity(renderFollow(follower, followee, url));
				}

				// Another situation is there is only requestId, then obtained object from database.
				const followRequest = await FollowRequests.findOneBy({
					id: parsed.id,
				});
				if (followRequest == null) {
					throw new Error("resolveLocal: invalid follow URI");
				}
				const follower = await Users.findOneBy({
					id: followRequest.followerId,
					host: IsNull(),
				});
				const followee = await Users.findOneBy({
					id: followRequest.followeeId,
					host: Not(IsNull()),
				});
				if (follower == null || followee == null) {
					throw new Error("resolveLocal: invalid follow URI");
				}
				return renderActivity(renderFollow(follower, followee, url));
			}
			default:
				throw new Error(`resolveLocal: type ${parsed.type} unhandled`);
		}
	}
}
