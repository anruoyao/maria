import {
	PrimaryColumn,
	Entity,
	Index,
	JoinColumn,
	Column,
	ManyToOne,
	type Relation,
} from "typeorm";
import { Note } from "./note.js";
import { User } from "./user.js";
import { id } from "../id.js";

@Entity()
@Index(["userId", "noteId"], { unique: true })
export class UserNotePining {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the UserNotePinings.",
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Column(id())
	public noteId: Note["id"];

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
