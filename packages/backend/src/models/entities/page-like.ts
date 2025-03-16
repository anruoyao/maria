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
import { Page } from "./page.js";

@Entity()
@Index(["userId", "pageId"], { unique: true })
export class PageLike {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone")
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Column(id())
	public pageId: Page["id"];

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => Page, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public page: Relation<Page>;
	//#endregion
}
