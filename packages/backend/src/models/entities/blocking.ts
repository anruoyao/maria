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
import { id } from "../id.js";

@Entity()
@Index(["blockerId", "blockeeId"], { unique: true })
export class Blocking {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the Blocking.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The blockee user ID.",
	})
	public blockeeId: User["id"];

	@Index()
	@Column({
		...id(),
		comment: "The blocker user ID.",
	})
	public blockerId: User["id"];

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public blockee: Relation<User>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public blocker: Relation<User>;
	//#endregion
}
