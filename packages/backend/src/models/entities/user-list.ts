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
export class UserList {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the UserList.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The owner ID.",
	})
	public userId: User["id"];

	@Column("varchar", {
		length: 128,
		comment: "The name of the UserList.",
	})
	public name: string;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;
	//#endregion
}
