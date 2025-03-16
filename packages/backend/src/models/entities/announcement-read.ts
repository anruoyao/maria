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
import { Announcement } from "./announcement.js";
import { id } from "../id.js";

@Entity()
@Index(["userId", "announcementId"], { unique: true })
export class AnnouncementRead {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the AnnouncementRead.",
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Index()
	@Column(id())
	public announcementId: Announcement["id"];

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => Announcement, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public announcement: Relation<Announcement>;
	//#endregion
}
