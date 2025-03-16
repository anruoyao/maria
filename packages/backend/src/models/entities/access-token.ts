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
export class AccessToken {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the AccessToken.",
	})
	public createdAt: Date;

	@Column("timestamp with time zone", {
		nullable: true,
	})
	public lastUsedAt: Date | null;

	@Index()
	@Column("varchar", {
		length: 128,
	})
	public token: string;

	@Index()
	@Column("varchar", {
		length: 128,
		nullable: true,
	})
	public session: string | null;

	@Index()
	@Column("varchar", {
		length: 128,
	})
	public hash: string;

	@Index()
	@Column({
		...id(),
		nullable: true,
	})
	public userId: User["id"] | null;

	@Column({
		...id(),
		nullable: true,
	})
	public appId: App["id"] | null;

	@Column("varchar", {
		length: 128,
		nullable: true,
	})
	public name: string | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
	})
	public description: string | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
	})
	public iconUrl: string | null;

	@Column("varchar", {
		length: 64,
		array: true,
		default: "{}",
	})
	public permission: string[];

	@Column("boolean", {
		default: false,
	})
	public fetched: boolean;

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
