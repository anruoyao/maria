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
import { UserList } from "./user-list.js";
import { id } from "../id.js";

@Entity()
@Index(["userId", "userListId"], { unique: true })
export class UserListJoining {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the UserListJoining.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The user ID.",
	})
	public userId: User["id"];

	@Index()
	@Column({
		...id(),
		comment: "The list ID.",
	})
	public userListId: UserList["id"];

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => UserList, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public userList: Relation<UserList>;
	//#endregion
}
