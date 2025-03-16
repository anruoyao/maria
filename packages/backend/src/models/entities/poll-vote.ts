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
@Index(["userId", "noteId", "choice"], { unique: true })
export class PollVote {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the PollVote.",
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Index()
	@Column(id())
	public noteId: Note["id"];

	@Column("integer")
	public choice: number;

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
