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
export class NoteReaction {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the NoteReaction.",
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Index()
	@Column(id())
	public noteId: Note["id"];

	// TODO: 対象noteのuserIdを非正規化したい(「受け取ったリアクション一覧」のようなものを(JOIN無しで)実装したいため)

	@Column("varchar", {
		length: 260,
	})
	public reaction: string;

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
