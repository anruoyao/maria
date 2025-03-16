import {
	Entity,
	PrimaryColumn,
	Index,
	Column,
	ManyToOne,
	JoinColumn,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { App } from "./app.js";
import { id } from "../id.js";

@Entity()
export class AuthSession {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the AuthSession.",
	})
	public createdAt: Date;

	@Index()
	@Column("varchar", {
		length: 128,
	})
	public token: string;

	@Column({
		...id(),
		nullable: true,
	})
	public userId: User["id"] | null;

	@Column(id())
	public appId: App["id"];

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => App, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public app: Relation<App>;
	//#endregion
}
