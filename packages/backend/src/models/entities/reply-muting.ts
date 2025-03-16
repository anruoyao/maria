import {
	PrimaryColumn,
	Entity,
	Index,
	// JoinColumn,
	Column,
	// ManyToOne,
	// type Relation,
} from "typeorm";
import { id } from "../id.js";
import type { User } from "./user.js";

@Entity()
@Index(["muterId", "muteeId"], { unique: true })
export class ReplyMuting {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the Muting.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The mutee user ID.",
	})
	public muteeId: User["id"];

	@Index()
	@Column({
		...id(),
		comment: "The muter user ID.",
	})
	public muterId: User["id"];

	//#region Relations
	/* FIXME: There is no such relation */
	// @ManyToOne(() => User, {
	// 	onDelete: "CASCADE",
	// })
	// @JoinColumn()
	// public mutee: Relation<User>;

	/* FIXME: There is no such relation */
	// @ManyToOne(() => User, {
	// 	onDelete: "CASCADE",
	// })
	// @JoinColumn()
	// public muter: Relation<User>;
	//#endregion
}
