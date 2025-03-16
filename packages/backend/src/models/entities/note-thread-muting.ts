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
@Index(["userId", "threadId"], { unique: true })
export class NoteThreadMuting {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
	})
	public userId: User["id"];

	@Index()
	@Column("varchar", {
		length: 256,
	})
	public threadId: string;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;
	//#endregion
}
