import {
	Entity,
	Index,
	JoinColumn,
	Column,
	PrimaryColumn,
	ManyToOne,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { id } from "../id.js";

@Entity()
export class UserGroup {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the UserGroup.",
	})
	public createdAt: Date;

	@Column("varchar", {
		length: 256,
	})
	public name: string;

	@Index()
	@Column({
		...id(),
		comment: "The ID of owner.",
	})
	public userId: User["id"];

	@Column("boolean", {
		default: false,
	})
	public isPrivate: boolean;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;
	//#endregion

	constructor(data: Partial<UserGroup>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
