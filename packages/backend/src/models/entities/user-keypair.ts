import {
	PrimaryColumn,
	Entity,
	JoinColumn,
	Column,
	OneToOne,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { id } from "../id.js";

@Entity()
export class UserKeypair {
	@PrimaryColumn(id())
	public userId: User["id"];

	@Column("varchar", {
		length: 4096,
	})
	public publicKey: string;

	@Column("varchar", {
		length: 4096,
	})
	public privateKey: string;

	//#region Relations
	@OneToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;
	//#endregion

	constructor(data: Partial<UserKeypair>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
