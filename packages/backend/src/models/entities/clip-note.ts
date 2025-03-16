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
import { Clip } from "./clip.js";
import { id } from "../id.js";

@Entity()
@Index(["noteId", "clipId"], { unique: true })
export class ClipNote {
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
		comment: "The clip ID.",
	})
	public clipId: Clip["id"];

	//#region Relations
	@ManyToOne(() => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Relation<Note>;

	@ManyToOne(() => Clip, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public clip: Relation<Clip>;
	//#endregion
}
