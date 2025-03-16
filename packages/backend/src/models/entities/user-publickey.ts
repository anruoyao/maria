import {
	PrimaryColumn,
	Entity,
	Index,
	JoinColumn,
	Column,
	OneToOne,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { id } from "../id.js";

@Entity()
export class UserPublickey {
	@PrimaryColumn(id())
	public userId: User["id"];

	@Index({ unique: true })
	@Column("varchar", {
		length: 512,
	})
	public keyId: string;

	@Column("varchar", {
		length: 4096,
	})
	public keyPem: string;

	//#region Relations
	@OneToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;
	//#endregion

	constructor(data: Partial<UserPublickey>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
