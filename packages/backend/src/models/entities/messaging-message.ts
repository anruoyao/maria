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
import { DriveFile } from "./drive-file.js";
import { id } from "../id.js";
import { UserGroup } from "./user-group.js";

@Entity()
export class MessagingMessage {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the MessagingMessage.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The sender user ID.",
	})
	public userId: User["id"];

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The recipient user ID.",
	})
	public recipientId: User["id"] | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The recipient group ID.",
	})
	public groupId: UserGroup["id"] | null;

	@Column("varchar", {
		length: 4096,
		nullable: true,
	})
	public text: string | null;

	@Column("boolean", {
		default: false,
	})
	public isRead: boolean;

	@Column("varchar", {
		length: 512,
		nullable: true,
	})
	public uri: string | null;

	@Column({
		...id(),
		array: true,
		default: "{}",
	})
	public reads: User["id"][];

	@Column({
		...id(),
		nullable: true,
	})
	public fileId: DriveFile["id"] | null;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public recipient: Relation<User>;

	@ManyToOne(() => UserGroup, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public group: Relation<UserGroup | null>;

	@ManyToOne(() => DriveFile, {
		onDelete: "SET NULL",
		nullable: true,
	})
	@JoinColumn()
	public file: Relation<DriveFile | null>;
	//#endregion
}
