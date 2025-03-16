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
import { Channel } from "./channel.js";

@Entity()
@Index(["followerId", "followeeId"], { unique: true })
export class ChannelFollowing {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the ChannelFollowing.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The followee channel ID.",
	})
	public followeeId: Channel["id"];

	@Index()
	@Column({
		...id(),
		comment: "The follower user ID.",
	})
	public followerId: User["id"];

	//#region Relations
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public followee: Relation<Channel>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public follower: Relation<User>;
	//#endregion
}
