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
@Index(["muterId", "muteeId"], { unique: true })
export class Muting {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the Muting.",
	})
	public createdAt: Date;

	@Index()
	@Column("timestamp with time zone", {
		nullable: true,
	})
	public expiresAt: Date | null;

	@Index()
	@Column({
		...id(),
		comment: "The mutee user ID.",
	})
	public muteeId: User["id"];

	@Index()
	@Column({
		...id(),
		comment: "The muter user ID.",
	})
	public muterId: User["id"];

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public mutee: Relation<User>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public muter: Relation<User>;
	//#endregion
}
