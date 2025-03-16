import {
	PrimaryColumn,
	Entity,
	Index,
	JoinColumn,
	Column,
	ManyToOne,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { id } from "../id.js";
import { AccessToken } from "./access-token.js";

// for Mastodon push notifications
const pushSubscriptionTypes = [
	"mention",
	"status",
	"reblog",
	"follow",
	"follow_request",
	"favourite",
	"poll",
	"update",
	"admin.sign_up",
	"admin.report",
] as const;

type pushSubscriptionType = (typeof pushSubscriptionTypes)[number];

@Entity()
export class SwSubscription {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone")
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Column("varchar", {
		length: 512,
	})
	public endpoint: string;

	@Column("varchar", {
		length: 256,
	})
	public auth: string;

	@Column("varchar", {
		length: 128,
	})
	public publickey: string;

	@Column("boolean", {
		default: false,
	})
	public sendReadMessage: boolean;

	/**
	 * Type of subscription, used for Mastodon API notifications.
	 * Empty for Misskey notifications.
	 */
	@Column({
		type: "enum",
		enum: pushSubscriptionTypes,
		array: true,
		default: "{}",
	})
	public subscriptionTypes: pushSubscriptionType[];

	/**
	 * App notification app, used for Mastodon API notifications
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
	public user: Relation<User>;

	@ManyToOne(() => AccessToken, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public appAccessToken: Relation<AccessToken | null>;
	//#endregion
}
