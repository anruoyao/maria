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
export class AbuseUserReport {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the AbuseUserReport.",
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public targetUserId: User["id"];

	@Index()
	@Column(id())
	public reporterId: User["id"];

	@Column({
		...id(),
		nullable: true,
	})
	public assigneeId: User["id"] | null;

	@Index()
	@Column("boolean", {
		default: false,
	})
	public resolved: boolean;

	@Column("boolean", {
		default: false,
	})
	public forwarded: boolean;

	@Column("varchar", {
		length: 2048,
	})
	public comment: string;

	//#region Denormalized fields
	@Index()
	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public targetUserHost: string | null;

	@Index()
	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public reporterHost: string | null;
	//#endregion

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public targetUser: Relation<User>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public reporter: Relation<User>;

	@ManyToOne(() => User, {
		onDelete: "SET NULL",
		nullable: true,
	})
	@JoinColumn()
	public assignee: Relation<User | null>;
	//#endregion
}
