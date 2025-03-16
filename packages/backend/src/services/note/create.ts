import * as mfm from "mfm-js";
import DeliverManager from "@/remote/activitypub/deliver-manager.js";
import renderNote from "@/remote/activitypub/renderer/note.js";
import renderCreate from "@/remote/activitypub/renderer/create.js";
import renderAnnounce from "@/remote/activitypub/renderer/announce.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { resolveUser } from "@/remote/resolve-user.js";
import { config } from "@/config.js";
import { updateHashtags } from "@/services/update-hashtag.js";
import { concat } from "@/prelude/array.js";
import { insertNoteUnread } from "@/services/note/unread.js";
import { registerOrFetchInstanceDoc } from "@/services/register-or-fetch-instance-doc.js";
import { extractMentions } from "@/misc/extract-mentions.js";
import { extractCustomEmojisFromMfm } from "@/misc/extract-custom-emojis-from-mfm.js";
import { extractHashtags } from "@/misc/extract-hashtags.js";
import type { IMentionedRemoteUsers } from "@/models/entities/note.js";
import { Note } from "@/models/entities/note.js";
import {
	Mutings,
	Users,
	NoteWatchings,
	Notes,
	Instances,
	UserProfiles,
	MutedNotes,
	Channels,
	ChannelFollowings,
	NoteThreadMutings,
	NoteFiles,
} from "@/models/index.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import type { App } from "@/models/entities/app.js";
import { Not, In } from "typeorm";
import type { User, ILocalUser, IRemoteUser } from "@/models/entities/user.js";
import { activeUsersChart } from "@/services/chart/index.js";
import type { IPoll } from "@/models/entities/poll.js";
import { Poll } from "@/models/entities/poll.js";
import { createNotification } from "@/services/create-notification.js";
import { isDuplicateKeyValueError } from "@/misc/is-duplicate-key-value-error.js";
import {
	updateAntennasOnNewNote,
	checkWordMute,
	genId,
	genIdAt,
	isQuote,
	isSilencedServer,
	publishToNotesStream,
	publishToNoteStream,
	NoteEvent,
	publishToMainStream,
	Event,
} from "backend-rs";
import { countSameRenotes } from "@/misc/count-same-renotes.js";
import { deliverToRelays, getCachedRelays } from "../relay.js";
import type { Channel } from "@/models/entities/channel.js";
import { normalizeForSearch } from "@/misc/normalize-for-search.js";
import { endedPollNotificationQueue } from "@/queue/queues.js";
import { webhookDeliver } from "@/queue/index.js";
import { Cache } from "@/misc/cache.js";
import type { UserProfile } from "@/models/entities/user-profile.js";
import { db } from "@/db/postgre.js";
import { getActiveWebhooks } from "@/misc/webhook-cache.js";
import { redisClient } from "@/db/redis.js";
import { Mutex } from "redis-semaphore";
import { bcp47Pattern } from "firefish-js";
import Logger from "@/services/logger.js";
import { inspect } from "node:util";
import { toRustObject } from "@/prelude/undefined-to-null.js";

const logger = new Logger("create-note");

const hardMutesCache = new Cache<
	{
		userId: UserProfile["userId"];
		mutedWords: UserProfile["mutedWords"];
		mutedPatterns: UserProfile["mutedPatterns"];
	}[]
>("hardMutes", 60 * 5);

type NotificationType = "reply" | "renote" | "quote" | "mention";

class NotificationManager {
	private notifier: { id: User["id"] };
	private note: Note;
	private queue: {
		target: ILocalUser["id"];
		reason: NotificationType;
	}[];

	constructor(notifier: { id: User["id"] }, note: Note) {
		this.notifier = notifier;
		this.note = note;
		this.queue = [];
	}

	public push(notifiee: ILocalUser["id"], reason: NotificationType) {
		// 自分自身へは通知しない
		if (this.notifier.id === notifiee) return;

		const exist = this.queue.find((x) => x.target === notifiee);

		if (exist) {
			// 「メンションされているかつ返信されている」場合は、メンションとしての通知ではなく返信としての通知にする
			if (reason !== "mention") {
				exist.reason = reason;
			}
		} else {
			this.queue.push({
				reason: reason,
				target: notifiee,
			});
		}
	}

	public async deliver() {
		for (const x of this.queue) {
			// ミュート情報を取得
			const mentioneeMutes = await Mutings.findBy({
				muterId: x.target,
			});

			const mentioneesMutedUserIds = mentioneeMutes.map((m) => m.muteeId);

			// 通知される側のユーザーが通知する側のユーザーをミュートしていない限りは通知する
			if (!mentioneesMutedUserIds.includes(this.notifier.id)) {
				createNotification(x.target, x.reason, {
					notifierId: this.notifier.id,
					noteId: this.note.id,
					note: this.note,
				});
			}
		}
	}
}

type UserLike = Pick<User, "id" | "host" | "username" | "uri">;
type NoteLike = {
	createdAt?: Date | null;
	scheduledAt?: Date | null;
	name?: string | null;
	text?: string | null;
	lang?: string | null;
	reply?: Note | null;
	renote?: Note | null;
	files?: DriveFile[] | null;
	poll?: IPoll | null;
	localOnly?: boolean | null;
	cw?: string | null;
	visibility?: string;
	visibleUsers?: UserLike[] | null;
	channel?: Channel | null;
	apMentions?: UserLike[] | null;
	apHashtags?: string[] | null;
	apEmojis?: string[] | null;
	uri?: string | null;
	url?: string | null;
	app?: App | null;
};

export default async (
	user: Pick<
		User,
		"id" | "username" | "host" | "isSilenced" | "createdAt" | "isBot"
	> & { inbox?: User["inbox"] },
	data: NoteLike,
	silent = false,
	waitToPublish?: (note: Note) => Promise<void>,
	dontFederateInitially = false,
) =>
	// biome-ignore lint/suspicious/noAsyncPromiseExecutor: FIXME
	new Promise<Note>(async (res, rej) => {
		dontFederateInitially =
			dontFederateInitially || data.visibility?.startsWith("hidden");

		// Whether this is a scheduled "draft" post (yet to be published)
		const isDraft = data.scheduledAt != null;

		// If you reply outside the channel, match the scope of the target.
		// TODO (I think it's a process that could be done on the client side, but it's server side for now.)
		if (
			data.reply &&
			data.channel &&
			data.reply.channelId !== data.channel.id
		) {
			if (data.reply.channelId) {
				data.channel = await Channels.findOneBy({ id: data.reply.channelId });
			} else {
				data.channel = null;
			}
		}

		// When you reply in a channel, match the scope of the target
		// TODO (I think it's a process that could be done on the client side, but it's server side for now.)
		if (data.reply && data.channel == null && data.reply.channelId) {
			data.channel = await Channels.findOneBy({ id: data.reply.channelId });
		}

		const now = new Date();
		if (
			!data.createdAt ||
			Number.isNaN(data.createdAt.getTime()) ||
			data.createdAt > now
		)
			data.createdAt = now;

		if (data.visibility == null) data.visibility = "public";
		if (data.localOnly == null) data.localOnly = false;
		if (data.channel != null) data.visibility = "public";
		if (data.channel != null) data.visibleUsers = [];
		if (data.channel != null) data.localOnly = true;

		// enforce silent clients on server
		if (
			user.isSilenced &&
			data.visibility === "public" &&
			data.channel == null
		) {
			data.visibility = "home";
		}

		// Enforce home visibility if the user is in a silenced instance.
		if (
			data.visibility === "public" &&
			Users.isRemoteUser(user) &&
			(await isSilencedServer(user.host))
		) {
			data.visibility = "home";
		}

		// Reject if the target of the renote is a public range other than "Home or Entire".
		if (
			data.renote &&
			data.renote.visibility !== "public" &&
			data.renote.visibility !== "home" &&
			data.renote.userId !== user.id
		) {
			return rej("Renote target is not public or home");
		}

		// If the target of the renote is not public, make it home.
		if (
			data.renote &&
			data.renote.visibility !== "public" &&
			data.visibility === "public"
		) {
			data.visibility = "home";
		}

		// If the target of Renote is followers, make it followers.
		if (data.renote && data.renote.visibility === "followers") {
			data.visibility = "followers";
		}

		// If the reply target is not public, make it home.
		if (
			data.reply &&
			data.reply.visibility !== "public" &&
			data.visibility === "public"
		) {
			data.visibility = "home";
		}

		// Renote local only if you Renote local only.
		if (data.renote?.localOnly && data.channel == null) {
			data.localOnly = true;
		}

		// If you reply to local only, make it local only.
		if (data.reply?.localOnly && data.channel == null) {
			data.localOnly = true;
		}

		data.text = data.text?.trim() ?? null;

		if (data.lang != null) {
			if (!bcp47Pattern.test(data.lang)) rej("Invalid language code");
			data.lang = data.lang.toLowerCase();
		} else {
			data.lang = null;
		}

		let tags = data.apHashtags;
		let emojis = data.apEmojis;
		let mentionedUsers = data.apMentions;

		// Parse MFM if needed
		if (!(tags && emojis && mentionedUsers)) {
			const tokens = data.text ? mfm.parse(data.text) : [];
			const cwTokens = data.cw ? mfm.parse(data.cw) : [];
			const choiceTokens = data.poll?.choices
				? concat(data.poll.choices.map((choice) => mfm.parse(choice)))
				: [];

			const combinedTokens = tokens.concat(cwTokens).concat(choiceTokens);

			tags = data.apHashtags || extractHashtags(combinedTokens);

			emojis = data.apEmojis || extractCustomEmojisFromMfm(combinedTokens);

			mentionedUsers =
				data.apMentions || (await extractMentionedUsers(user, combinedTokens));
		}

		tags = tags
			.filter((tag) => Array.from(tag || "").length <= 128)
			.splice(0, 32);

		if (
			data.reply != null &&
			user.id !== data.reply.userId &&
			!mentionedUsers.some((u) => u.id === data.reply?.userId)
		) {
			mentionedUsers.push(
				await Users.findOneByOrFail({ id: data.reply.userId }),
			);
		}

		if (!isDraft && data.visibility === "specified") {
			if (data.visibleUsers == null) rej("invalid param");

			for (const u of data.visibleUsers) {
				if (!mentionedUsers.some((x) => x.id === u.id)) {
					mentionedUsers.push(u);
				}
			}

			if (
				data.reply &&
				!data.visibleUsers.some((x) => x.id === data.reply?.userId)
			) {
				data.visibleUsers.push(
					await Users.findOneByOrFail({ id: data.reply?.userId }),
				);
			}
		}

		const note = await insertNote(user, data, tags, emojis, mentionedUsers);

		await NoteFiles.insert(
			note.fileIds.map((fileId) => ({ noteId: note.id, fileId })),
		).catch((e) => {
			logger.error(inspect(e));
		});

		res(note);

		if (waitToPublish) await waitToPublish(note);

		// Register host
		if (Users.isRemoteUser(user)) {
			registerOrFetchInstanceDoc(user.host).then((i) => {
				Instances.increment({ id: i.id }, "notesCount", 1);
			});
		}

		if (!isDraft) {
			// ハッシュタグ更新
			if (data.visibility === "public" || data.visibility === "home") {
				updateHashtags(user, tags);
			}

			// Increment notes count (user)
			incNotesCountOfUser(user);

			// Word mutes & antenna
			const thisNoteIsMutedBy: string[] = [];

			await hardMutesCache
				.fetch(null, () =>
					UserProfiles.find({
						where: {
							enableWordMute: true,
						},
						select: ["userId", "mutedWords", "mutedPatterns"],
					}),
				)
				.then(async (us) => {
					for (const u of us) {
						if (u.userId === user.id) return;
						await checkWordMute(note, u.mutedWords, u.mutedPatterns).then(
							(shouldMute: boolean) => {
								if (shouldMute) {
									thisNoteIsMutedBy.push(u.userId);
									MutedNotes.insert({
										id: genId(),
										userId: u.userId,
										noteId: note.id,
										reason: "word",
									});
								}
							},
						);
					}
				});

			const _note = toRustObject(note);
			if (note.renoteId == null || isQuote(_note)) {
				await updateAntennasOnNewNote(_note, user, thisNoteIsMutedBy);
			}

			// Channel
			if (note.channelId != null) {
				ChannelFollowings.findBy({ followeeId: note.channelId }).then(
					(followings) => {
						for (const following of followings) {
							insertNoteUnread(following.followerId, note, {
								isSpecified: false,
								isMentioned: false,
							});
						}
					},
				);
			}

			if (data.reply) {
				saveReply(data.reply, note);
			}

			// この投稿を除く指定したユーザーによる指定したノートのリノートが存在しないとき
			if (
				data.renote &&
				!user.isBot &&
				(await countSameRenotes(user.id, data.renote.id, note.id)) === 0
			) {
				incRenoteCount(data.renote);
			}

			if (data.poll?.expiresAt) {
				const delay = data.poll.expiresAt.getTime() - Date.now();
				endedPollNotificationQueue.add(
					{
						noteId: note.id,
					},
					{
						delay,
						removeOnComplete: true,
					},
				);
			}

			if (!silent) {
				if (Users.isLocalUser(user)) activeUsersChart.write(user);

				// 未読通知を作成
				if (data.visibility === "specified") {
					if (data.visibleUsers == null) rej("invalid param");

					for (const u of data.visibleUsers) {
						// ローカルユーザーのみ
						if (!Users.isLocalUser(u)) continue;

						insertNoteUnread(u.id, note, {
							isSpecified: true,
							isMentioned: false,
						});
					}
				} else {
					for (const u of mentionedUsers) {
						// ローカルユーザーのみ
						if (!Users.isLocalUser(u)) continue;

						insertNoteUnread(u.id, note, {
							isSpecified: false,
							isMentioned: true,
						});
					}
				}

				if (note.replyId != null) {
					// Only provide the reply note id here as the recipient may not be authorized to see the note.
					publishToNoteStream(note.replyId, NoteEvent.Reply, {
						id: note.id,
					});
				}

				const webhooks = await getActiveWebhooks().then((webhooks) =>
					webhooks.filter((x) => x.userId === user.id && x.on.includes("note")),
				);

				for (const webhook of webhooks) {
					webhookDeliver(webhook, "note", {
						note: await Notes.pack(note, user),
					});
				}

				const nm = new NotificationManager(user, note);
				const nmRelatedPromises = [];

				await createMentionedEvents(mentionedUsers, note, nm);

				// If has in reply to note
				if (data.reply != null) {
					// Fetch watchers
					nmRelatedPromises.push(
						notifyToWatchersOfReplyee(data.reply, user, nm),
					);

					// 通知
					if (data.reply.userHost === null) {
						const threadMuted = await NoteThreadMutings.findOneBy({
							userId: data.reply.userId,
							threadId: data.reply.threadId || data.reply.id,
						});

						if (!threadMuted) {
							nm.push(data.reply.userId, "reply");

							const packedReply = await Notes.pack(note, {
								id: data.reply.userId,
							});
							publishToMainStream(data.reply.userId, Event.Reply, packedReply);

							const webhooks = (await getActiveWebhooks()).filter(
								(x) =>
									x.userId === data.reply?.userId && x.on.includes("reply"),
							);
							for (const webhook of webhooks) {
								webhookDeliver(webhook, "reply", {
									note: packedReply,
								});
							}
						}
					}
				}

				// If it is renote
				if (data.renote != null) {
					const type = data.text ? "quote" : "renote";

					// Notify
					if (data.renote.userHost === null) {
						const threadMuted = await NoteThreadMutings.findOneBy({
							userId: data.renote.userId,
							threadId: data.renote.threadId || data.renote.id,
						});

						if (!threadMuted) {
							nm.push(data.renote.userId, type);
						}
					}
					// Fetch watchers
					nmRelatedPromises.push(
						notifyToWatchersOfRenotee(data.renote, user, nm, type),
					);

					// Publish event
					if (user.id !== data.renote.userId && data.renote.userHost === null) {
						const packedRenote = await Notes.pack(note, {
							id: data.renote.userId,
						});
						publishToMainStream(data.renote.userId, Event.Renote, packedRenote);

						const renote = data.renote;
						const webhooks = (await getActiveWebhooks()).filter(
							(x) => x.userId === renote.userId && x.on.includes("renote"),
						);
						for (const webhook of webhooks) {
							webhookDeliver(webhook, "renote", {
								note: packedRenote,
							});
						}
					}
				}

				Promise.all(nmRelatedPromises).then(() => {
					nm.deliver();
				});

				//#region AP deliver
				if (Users.isLocalUser(user) && !dontFederateInitially) {
					(async () => {
						const noteActivity = await renderNoteOrRenoteActivity(data, note);
						const dm = new DeliverManager(user, noteActivity);

						// メンションされたリモートユーザーに配送
						for (const u of mentionedUsers.filter((u) =>
							Users.isRemoteUser(u),
						)) {
							dm.addDirectRecipe(u as IRemoteUser);
						}

						// 投稿がリプライかつ投稿者がローカルユーザーかつリプライ先の投稿の投稿者がリモートユーザーなら配送
						if (data.reply?.userHost != null) {
							const u = await Users.findOneBy({ id: data.reply.userId });
							if (u && Users.isRemoteUser(u)) dm.addDirectRecipe(u);
						}

						// 投稿がRenoteかつ投稿者がローカルユーザーかつRenote元の投稿の投稿者がリモートユーザーなら配送
						if (data.renote?.userHost != null) {
							const u = await Users.findOneBy({ id: data.renote.userId });
							if (u && Users.isRemoteUser(u)) dm.addDirectRecipe(u);
						}

						// フォロワーに配送
						if (["public", "home", "followers"].includes(note.visibility)) {
							dm.addFollowersRecipe();
						}

						if (["public"].includes(note.visibility)) {
							deliverToRelays(user, noteActivity);
						}

						dm.execute();
					})();
				}
				//#endregion
			}

			if (data.channel) {
				Channels.increment({ id: data.channel.id }, "notesCount", 1);
				Channels.update(data.channel.id, {
					lastNotedAt: new Date(),
				});

				await Notes.countBy({
					userId: user.id,
					channelId: data.channel.id,
				}).then((count) => {
					// この処理が行われるのはノート作成後なので、ノートが一つしかなかったら最初の投稿だと判断できる
					// TODO: とはいえノートを削除して何回も投稿すればその分だけインクリメントされる雑さもあるのでどうにかしたい
					if (count === 1 && data.channel != null) {
						Channels.increment({ id: data.channel.id }, "usersCount", 1);
					}
				});
			}
		}

		if (!dontFederateInitially) {
			let publishKey: string;
			let noteToPublish: Note;
			const relays = await getCachedRelays();

			// Some relays (e.g., aode-relay) deliver posts by boosting them as
			// Announce activities. In that case, user is the relay's actor.
			const boostedByRelay =
				!!user.inbox && relays.map((relay) => relay.inbox).includes(user.inbox);

			if (boostedByRelay && data.renote && data.renote.userHost) {
				publishKey = `publishedNote:${data.renote.id}`;
				noteToPublish = data.renote;
			} else {
				publishKey = `publishedNote:${note.id}`;
				noteToPublish = note;
			}

			const lock = new Mutex(redisClient, "publishedNote");
			await lock.acquire();
			try {
				const published = (await redisClient.get(publishKey)) != null;
				if (!published) {
					await redisClient.set(publishKey, "done", "EX", 30);
					if (noteToPublish.renoteId) {
						// Prevents other threads from publishing the boosting post
						await redisClient.set(
							`publishedNote:${noteToPublish.renoteId}`,
							"done",
							"EX",
							30,
						);
					}
					publishToNotesStream(toRustObject(noteToPublish));
				}
			} finally {
				await lock.release();
			}
		}
	});

async function renderNoteOrRenoteActivity(data: NoteLike, note: Note) {
	if (data.localOnly) return null;

	const content =
		data.renote &&
		data.text == null &&
		data.poll == null &&
		(data.files == null || data.files.length === 0)
			? renderAnnounce(
					data.renote.uri
						? data.renote.uri
						: `${config.url}/notes/${data.renote.id}`,
					note,
				)
			: renderCreate(await renderNote(note, false), note);

	return renderActivity(content);
}

function incRenoteCount(renote: Note) {
	Notes.createQueryBuilder()
		.update()
		.set({
			renoteCount: () => '"renoteCount" + 1',
			score: () => '"score" + 1',
		})
		.where("id = :id", { id: renote.id })
		.execute();
}

async function insertNote(
	user: { id: User["id"]; host: User["host"] },
	data: NoteLike,
	tags: string[],
	emojis: string[],
	mentionedUsers: UserLike[],
) {
	data.createdAt ??= new Date();

	const note = new Note({
		id: genIdAt(data.createdAt),
		createdAt: data.createdAt,
		scheduledAt: data.scheduledAt ?? null,
		fileIds: data.files ? data.files.map((file) => file.id) : [],
		replyId: data.reply ? data.reply.id : null,
		renoteId: data.renote ? data.renote.id : null,
		channelId: data.channel ? data.channel.id : null,
		threadId: data.reply
			? data.reply.threadId
				? data.reply.threadId
				: data.reply.id
			: null,
		name: data.name,
		text: data.text,
		lang: data.lang,
		hasPoll: data.poll != null,
		cw: data.cw == null ? null : data.cw,
		tags: tags.map((tag) => normalizeForSearch(tag)),
		emojis,
		userId: user.id,
		localOnly: data.localOnly || false,
		visibility: data.visibility as any,
		visibleUserIds:
			data.visibility === "specified"
				? data.visibleUsers
					? data.visibleUsers.map((u) => u.id)
					: []
				: [],

		attachedFileTypes: data.files ? data.files.map((file) => file.type) : [],

		// denormalized fields
		replyUserId: data.reply ? data.reply.userId : null,
		replyUserHost: data.reply ? data.reply.userHost : null,
		renoteUserId: data.renote ? data.renote.userId : null,
		renoteUserHost: data.renote ? data.renote.userHost : null,
		userHost: user.host,
		updatedAt: undefined,
		uri: data.uri ?? undefined,
		url: data.url ?? undefined,
	});

	// Append mentions data
	if (mentionedUsers.length > 0) {
		note.mentions = mentionedUsers.map((u) => u.id);
		const profiles = await UserProfiles.findBy({ userId: In(note.mentions) });
		note.mentionedRemoteUsers = JSON.stringify(
			mentionedUsers
				.filter((u) => Users.isRemoteUser(u))
				.map((u) => {
					const profile = profiles.find((p) => p.userId === u.id);
					const url = profile?.url ?? null;
					return {
						uri: u.uri,
						url: url ?? undefined,
						username: u.username,
						host: u.host,
					} as IMentionedRemoteUsers[0];
				}),
		);
	}

	// 投稿を作成
	try {
		if (note.hasPoll) {
			// Start transaction
			await db.transaction(async (transactionalEntityManager) => {
				if (!data.poll) throw new Error("Empty poll data");

				await transactionalEntityManager.insert(Note, note);

				let expiresAt: Date | null;
				if (
					!data.poll.expiresAt ||
					Number.isNaN(data.poll.expiresAt.getTime())
				) {
					expiresAt = null;
				} else {
					expiresAt = data.poll.expiresAt;
				}

				const poll = new Poll({
					noteId: note.id,
					choices: data.poll.choices,
					expiresAt,
					multiple: data.poll.multiple,
					votes: new Array(data.poll.choices.length).fill(0),
					noteVisibility: note.visibility,
					userId: user.id,
					userHost: user.host,
				});

				await transactionalEntityManager.insert(Poll, poll);
			});
		} else {
			await Notes.insert(note);
		}

		return note;
	} catch (e) {
		// duplicate key error
		if (isDuplicateKeyValueError(e)) {
			const err = new Error("Duplicated note");
			err.name = "duplicated";
			throw err;
		}

		logger.error(inspect(e));

		throw e;
	}
}

async function notifyToWatchersOfRenotee(
	renote: Note,
	user: { id: User["id"] },
	nm: NotificationManager,
	type: NotificationType,
) {
	const watchers = await NoteWatchings.findBy({
		noteId: renote.id,
		userId: Not(user.id),
	});

	for (const watcher of watchers) {
		nm.push(watcher.userId, type);
	}
}

async function notifyToWatchersOfReplyee(
	reply: Note,
	user: { id: User["id"] },
	nm: NotificationManager,
) {
	const watchers = await NoteWatchings.findBy({
		noteId: reply.id,
		userId: Not(user.id),
	});

	for (const watcher of watchers) {
		nm.push(watcher.userId, "reply");
	}
}

async function createMentionedEvents(
	mentionedUsers: UserLike[],
	note: Note,
	nm: NotificationManager,
) {
	for (const u of mentionedUsers.filter((u) => Users.isLocalUser(u))) {
		const isWordMuted = await MutedNotes.existsBy({
			userId: u.id,
			noteId: note.id,
		});
		if (isWordMuted) continue;

		const isThreadMuted = await NoteThreadMutings.existsBy({
			userId: u.id,
			threadId: note.threadId ?? note.id,
		});
		if (isThreadMuted) continue;

		// note with "specified" visibility might not be visible to mentioned users
		try {
			const detailPackedNote = await Notes.pack(note, u, {
				detail: true,
			});

			publishToMainStream(u.id, Event.Mention, detailPackedNote);

			const webhooks = (await getActiveWebhooks()).filter(
				(x) => x.userId === u.id && x.on.includes("mention"),
			);
			for (const webhook of webhooks) {
				webhookDeliver(webhook, "mention", {
					note: detailPackedNote,
				});
			}
		} catch (err) {
			if (err.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24") continue;
			throw err;
		}

		// Create notification
		nm.push(u.id, "mention");
	}
}

function saveReply(reply: Note, note: Note) {
	Notes.increment({ id: reply.id }, "repliesCount", 1);
}

function incNotesCountOfUser(user: { id: User["id"] }) {
	Users.createQueryBuilder()
		.update()
		.set({
			updatedAt: new Date(),
			notesCount: () => '"notesCount" + 1',
		})
		.where("id = :id", { id: user.id })
		.execute();
}

export async function extractMentionedUsers(
	user: { host: User["host"] },
	tokens: mfm.MfmNode[],
): Promise<User[]> {
	if (tokens == null) return [];

	const mentions = extractMentions(tokens);

	let mentionedUsers = (
		await Promise.all(
			mentions.map((m) =>
				resolveUser(m.username, m.host || user.host).catch(() => null),
			),
		)
	).filter((x) => x != null) as User[];

	// Drop duplicate users
	mentionedUsers = mentionedUsers.filter(
		(u, i, self) => i === self.findIndex((u2) => u.id === u2.id),
	);

	return mentionedUsers;
}
