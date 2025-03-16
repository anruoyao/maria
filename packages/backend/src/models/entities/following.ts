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

@Entity()
@Index(["followerId", "followeeId"], { unique: true })
export class Following {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the Following.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The followee user ID.",
	})
	public followeeId: User["id"];

	@Index()
	@Column({
		...id(),
		comment: "The follower user ID.",
	})
	public followerId: User["id"];

	//#region Denormalized fields
	@Index()
	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public followerHost: string | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public followerInbox: string | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public followerSharedInbox: string | null;

	@Index()
	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public followeeHost: string | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public followeeInbox: string | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public followeeSharedInbox: string | null;
	//#endregion

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public followee: Relation<User>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public follower: Relation<User>;
	//#endregion
}
