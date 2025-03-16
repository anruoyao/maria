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
import type { Channel } from "./channel.js";

@Entity()
@Index(["userId", "noteId"], { unique: true })
export class NoteUnread {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Index()
	@Column(id())
	public noteId: Note["id"];

	/**
	 * メンションか否か
	 */
	@Index()
	@Column("boolean")
	public isMentioned: boolean;

	/**
	 * ダイレクト投稿か否か
	 */
	@Index()
	@Column("boolean")
	public isSpecified: boolean;

	//#region Denormalized fields
	@Index()
	@Column({
		...id(),
		comment: "[Denormalized]",
	})
	public noteUserId: User["id"];

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "[Denormalized]",
	})
	public noteChannelId: Channel["id"] | null;
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
