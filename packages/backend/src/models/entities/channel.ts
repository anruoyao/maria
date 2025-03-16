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
import { DriveFile } from "./drive-file.js";

@Entity()
export class Channel {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the Channel.",
	})
	public createdAt: Date;

	@Index()
	@Column("timestamp with time zone", {
		nullable: true,
	})
	public lastNotedAt: Date | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The owner ID.",
	})
	public userId: User["id"] | null;

	@Column("varchar", {
		length: 128,
		comment: "The name of the Channel.",
	})
	public name: string;

	@Column("varchar", {
		length: 2048,
		nullable: true,
		comment: "The description of the Channel.",
	})
	public description: string | null;

	@Column({
		...id(),
		nullable: true,
		comment: "The ID of banner Channel.",
	})
	public bannerId: DriveFile["id"] | null;

	@Index()
	@Column("integer", {
		default: 0,
		comment: "The count of notes.",
	})
	public notesCount: number;

	@Index()
	@Column("integer", {
		default: 0,
		comment: "The count of users.",
	})
	public usersCount: number;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "SET NULL",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => DriveFile, {
		onDelete: "SET NULL",
	})
	@JoinColumn()
	public banner: Relation<DriveFile>;
	//#endregion
}
