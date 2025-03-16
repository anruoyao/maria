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
import { Note } from "./note.js";
import { id } from "../id.js";

@Entity()
@Index(["userId", "noteId"], { unique: true })
export class NoteWatching {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the NoteWatching.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The watcher ID.",
	})
	public userId: User["id"];

	@Index()
	@Column({
		...id(),
		comment: "The target Note ID.",
	})
	public noteId: Note["id"];

	//#region Denormalized fields
	@Index()
	@Column({
		...id(),
		comment: "[Denormalized]",
	})
	public noteUserId: Note["userId"];
	//#endregion

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Relation<Note>;
	//#endregion
}
