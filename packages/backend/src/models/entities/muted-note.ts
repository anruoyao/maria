import {
	Entity,
	Index,
	JoinColumn,
	Column,
	ManyToOne,
	PrimaryColumn,
	type Relation,
} from "typeorm";
import { Note } from "./note.js";
import { User } from "./user.js";
import { id } from "../id.js";
import { mutedNoteReasons } from "../../types.js";

@Entity()
@Index(["noteId", "userId"], { unique: true })
export class MutedNote {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column({
		...id(),
		comment: "The note ID.",
	})
	public noteId: Note["id"];

	@Index()
	@Column({
		...id(),
		comment: "The user ID.",
	})
	public userId: User["id"];

	/**
	 * ミュートされた理由。
	 */
	@Index()
	@Column("enum", {
		enum: mutedNoteReasons,
		comment: "The reason of the MutedNote.",
	})
	public reason: (typeof mutedNoteReasons)[number];

	//#region Relations
	@ManyToOne(() => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Relation<Note>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;
	//#endregion
}
