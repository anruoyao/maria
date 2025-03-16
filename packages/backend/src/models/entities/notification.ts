import {
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	Column,
	PrimaryColumn,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { id } from "../id.js";
import { Note } from "./note.js";
import { FollowRequest } from "./follow-request.js";
import { UserGroupInvitation } from "./user-group-invitation.js";
import { AccessToken } from "./access-token.js";
import { notificationTypes } from "@/types.js";

@Entity()
export class Notification {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the Notification.",
	})
	public createdAt: Date;

	/**
	 * Notification Recipient ID
	 */
	@Index()
	@Column({
		...id(),
		comment: "The ID of recipient user of the Notification.",
	})
	public notifieeId: User["id"];

	/**
	 * Notification sender (initiator)
	 */
	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The ID of sender user of the Notification.",
	})
	public notifierId: User["id"] | null;

	/**
	 * Notification types:
	 * follow - Follow request
	 * mention - User was referenced in a post.
	 * reply - A post that a user made (or was watching) has been replied to.
	 * renote - A post that a user made (or was watching) has been renoted.
	 * quote - A post that a user made (or was watching) has been quoted and renoted.
	 * reaction - (自分または自分がWatchしている)投稿にリアクションされた
	 * pollVote - (自分または自分がWatchしている)投稿のアンケートに投票された
	 * pollEnded - 自分のアンケートもしくは自分が投票したアンケートが終了した
	 * receiveFollowRequest - フォローリクエストされた
	 * followRequestAccepted - A follow request has been accepted.
	 * groupInvited - グループに招待された
	 * app - App notifications.
	 */
	@Index()
	@Column("enum", {
		enum: notificationTypes,
		comment: "The type of the Notification.",
	})
	public type: (typeof notificationTypes)[number];

	/**
	 * Whether the notification was read.
	 */
	@Index()
	@Column("boolean", {
		default: false,
		comment: "Whether the notification was read.",
	})
	public isRead: boolean;

	@Column({
		...id(),
		nullable: true,
	})
	public noteId: Note["id"] | null;

	@Column({
		...id(),
		nullable: true,
	})
	public followRequestId: FollowRequest["id"] | null;

	@Column({
		...id(),
		nullable: true,
	})
	public userGroupInvitationId: UserGroupInvitation["id"] | null;

	@Column("varchar", {
		length: 128,
		nullable: true,
	})
	public reaction: string | null;

	@Column("integer", {
		nullable: true,
	})
	public choice: number | null;

	/**
	 * App notification body
	 */
	@Column("varchar", {
		length: 2048,
		nullable: true,
	})
	public customBody: string | null;

	/**
	 * App notification header
	 * (If omitted, it is expected to be displayed with the app name)
	 */
	@Column("varchar", {
		length: 256,
		nullable: true,
	})
	public customHeader: string | null;

	/**
	 * App notification icon (URL)
	 * (If omitted, it is expected to be displayed as an app icon)
	 */
	@Column("varchar", {
		length: 1024,
		nullable: true,
	})
	public customIcon: string | null;

	/**
	 * App notification app (token for)
	 */
	@Index()
	@Column({
		...id(),
		nullable: true,
	})
	public appAccessTokenId: AccessToken["id"] | null;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public notifiee: Relation<User>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public notifier: Relation<User | null>;

	@ManyToOne(() => Note, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public note: Relation<Note | null>;

	@ManyToOne(() => FollowRequest, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public followRequest: Relation<FollowRequest | null>;

	@ManyToOne(() => UserGroupInvitation, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public userGroupInvitation: Relation<UserGroupInvitation | null>;

	@ManyToOne(() => AccessToken, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public appAccessToken: Relation<AccessToken | null>;
	//#endregion
}
