import { Event, publishToMainStream } from "backend-rs";
import type { Note } from "@/models/entities/note.js";
import type { User } from "@/models/entities/user.js";
import { NoteUnreads, Followings, ChannelFollowings } from "@/models/index.js";
import { Not, IsNull, In } from "typeorm";
import type { Channel } from "@/models/entities/channel.js";
import { readNotificationByQuery } from "@/server/api/common/read-notification.js";
import type { Packed } from "@/misc/schema.js";

/**
 * Mark notes as read
 */
export default async function (
	userId: User["id"],
	notes: (Note | Packed<"Note">)[],
	info?: {
		following: Set<User["id"]>;
		followingChannels: Set<Channel["id"]>;
	},
) {
	const following = info?.following
		? info.following
		: new Set<string>(
				(
					await Followings.find({
						where: {
							followerId: userId,
						},
						select: ["followeeId"],
					})
				).map((x) => x.followeeId),
			);
	const followingChannels = info?.followingChannels
		? info.followingChannels
		: new Set<string>(
				(
					await ChannelFollowings.find({
						where: {
							followerId: userId,
						},
						select: ["followeeId"],
					})
				).map((x) => x.followeeId),
			);

	// const myAntennas = (await getAntennas()).filter((a) => a.userId === userId);
	const readMentions: (Note | Packed<"Note">)[] = [];
	const readSpecifiedNotes: (Note | Packed<"Note">)[] = [];
	const readChannelNotes: (Note | Packed<"Note">)[] = [];
	// const readAntennaNotes: (Note | Packed<"Note">)[] = [];

	for (const note of notes) {
		if (note.mentions?.includes(userId)) {
			readMentions.push(note);
		} else if (note.visibleUserIds?.includes(userId)) {
			readSpecifiedNotes.push(note);
		}

		if (note.channelId && followingChannels.has(note.channelId)) {
			readChannelNotes.push(note);
		}
	}

	if (
		readMentions.length > 0 ||
		readSpecifiedNotes.length > 0 ||
		readChannelNotes.length > 0
	) {
		// Remove the record
		await NoteUnreads.delete({
			userId: userId,
			noteId: In([
				...readMentions.map((n) => n.id),
				...readSpecifiedNotes.map((n) => n.id),
				...readChannelNotes.map((n) => n.id),
			]),
		});

		// TODO: ↓まとめてクエリしたい

		NoteUnreads.countBy({
			userId: userId,
			isMentioned: true,
		}).then((mentionsCount) => {
			if (mentionsCount === 0) {
				// 全て既読になったイベントを発行
				publishToMainStream(userId, Event.ReadAllMentions, {});
			}
		});

		NoteUnreads.countBy({
			userId: userId,
			isSpecified: true,
		}).then((specifiedCount) => {
			if (specifiedCount === 0) {
				// 全て既読になったイベントを発行
				publishToMainStream(userId, Event.ReadAllDms, {});
			}
		});

		NoteUnreads.countBy({
			userId: userId,
			noteChannelId: Not(IsNull()),
		}).then((channelNoteCount) => {
			if (channelNoteCount === 0) {
				// 全て既読になったイベントを発行
				publishToMainStream(userId, Event.ReadAllChannelPosts, {});
			}
		});

		readNotificationByQuery(userId, {
			noteId: In([
				...readMentions.map((n) => n.id),
				...readSpecifiedNotes.map((n) => n.id),
			]),
		});
	}
}
