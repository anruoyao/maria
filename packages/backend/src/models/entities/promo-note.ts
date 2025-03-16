import {
	PrimaryColumn,
	Entity,
	Index,
	JoinColumn,
	Column,
	OneToOne,
	type Relation,
} from "typeorm";
import { Note } from "./note.js";
import type { User } from "./user.js";
import { id } from "../id.js";

@Entity()
export class PromoNote {
	@PrimaryColumn(id())
	public noteId: Note["id"];

	@Column("timestamp with time zone")
	public expiresAt: Date;

	//#region Denormalized fields
	@Index()
	@Column({
		...id(),
		comment: "[Denormalized]",
	})
	public userId: User["id"];
	//#endregion

	//#region Relations
	@OneToOne(() => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Relation<Note>;
	//#endregion
}
