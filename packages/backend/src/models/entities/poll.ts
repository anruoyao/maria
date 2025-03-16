import {
	PrimaryColumn,
	Entity,
	Index,
	JoinColumn,
	Column,
	OneToOne,
	type Relation,
} from "typeorm";
import { id } from "../id.js";
import { Note } from "./note.js";
import type { User } from "./user.js";
import { noteVisibilities } from "@/types.js";

@Entity()
export class Poll {
	@PrimaryColumn(id())
	public noteId: Note["id"];

	@Column("timestamp with time zone", {
		nullable: true,
	})
	public expiresAt: Date | null;

	@Column("boolean")
	public multiple: boolean;

	@Column("varchar", {
		length: 256,
		array: true,
		default: "{}",
	})
	public choices: string[];

	@Column("integer", {
		array: true,
	})
	public votes: number[];

	//#region Denormalized fields
	@Column("enum", {
		enum: noteVisibilities,
		comment: "[Denormalized]",
	})
	public noteVisibility: (typeof noteVisibilities)[number];

	@Column({
		...id(),
		comment: "[Denormalized]",
	})
	public userId: User["id"];

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public userHost: string | null;
	//#endregion

	//#region Relations
	@OneToOne(() => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Relation<Note>;
	//#endregion

	constructor(data: Partial<Poll>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}

export type IPoll = {
	choices: string[];
	votes?: number[];
	multiple: boolean;
	expiresAt: Date | null;
};
