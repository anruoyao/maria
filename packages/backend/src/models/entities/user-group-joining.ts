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
import { UserGroup } from "./user-group.js";
import { id } from "../id.js";

@Entity()
@Index(["userId", "userGroupId"], { unique: true })
export class UserGroupJoining {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the UserGroupJoining.",
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
		comment: "The group ID.",
	})
	public userGroupId: UserGroup["id"];

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => UserGroup, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public userGroup: Relation<UserGroup>;
	//#endregion
}
