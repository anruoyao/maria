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
export class ModerationLog {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the ModerationLog.",
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Column("varchar", {
		length: 128,
	})
	public type: string;

	@Column("jsonb")
	public info: Record<string, any>;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;
	//#endregion
}
