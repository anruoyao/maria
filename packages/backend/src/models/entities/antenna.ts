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
import { UserList } from "./user-list.js";
import { UserGroupJoining } from "./user-group-joining.js";

@Entity()
export class Antenna {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the Antenna.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The owner ID.",
	})
	public userId: User["id"];

	@Column("varchar", {
		length: 128,
		comment: "The name of the Antenna.",
	})
	public name: string;

	@Column("enum", {
		enum: ["home", "all", "users", "list", "group", "instances"],
	})
	public src: "home" | "all" | "users" | "list" | "group" | "instances";

	@Column({
		...id(),
		nullable: true,
	})
	public userListId: UserList["id"] | null;

	@Column({
		...id(),
		nullable: true,
	})
	public userGroupJoiningId: UserGroupJoining["id"] | null;

	@Column("varchar", {
		length: 1024,
		array: true,
		default: "{}",
	})
	public users: string[];

	@Column("varchar", {
		length: 512,
		array: true,
		default: "{}",
	})
	public instances: string[];

	// whitespace: AND condition
	// array items: OR condition
	// e.g., ["alpha beta", "gamma"]
	//   does match     "alpha beta", "beta alpha alpha", "gamma alpha", "gamma epsilon"
	//   does not match "alpha", "beta gamma", "alpha alpha", "eplison"
	@Column("text", {
		array: true,
		default: "{}",
	})
	public keywords: string[];

	// same match rule as `keywords`, except that this field is for excluded words
	@Column("text", {
		array: true,
		default: "{}",
	})
	public excludeKeywords: string[];

	@Column("boolean", {
		default: false,
	})
	public caseSensitive: boolean;

	@Column("boolean", {
		default: false,
	})
	public withReplies: boolean;

	@Column("boolean")
	public withFile: boolean;

	@Column("varchar", {
		length: 2048,
		nullable: true,
	})
	public expression: string | null;

	@Column("boolean")
	public notify: boolean;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public user: Relation<User | null>;

	@ManyToOne(() => UserList, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public userList: Relation<UserList | null>;

	@ManyToOne(() => UserGroupJoining, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public userGroupJoining: Relation<UserGroupJoining | null>;
	//#endregion
}
