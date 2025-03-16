import {
	PrimaryColumn,
	Entity,
	JoinColumn,
	Column,
	ManyToOne,
	Index,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { id } from "../id.js";

@Entity()
export class AttestationChallenge {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@PrimaryColumn(id())
	public userId: User["id"];

	@Index()
	@Column("varchar", {
		length: 64,
		comment: "Hex-encoded sha256 hash of the challenge.",
	})
	public challenge: string;

	@Column("timestamp with time zone", {
		comment: "The date challenge was created for expiry purposes.",
	})
	public createdAt: Date;

	@Column("boolean", {
		comment:
			"Indicates that the challenge is only for registration purposes if true to prevent the challenge for being used as authentication.",
		default: false,
	})
	public registrationChallenge: boolean;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;
	//#endregion

	constructor(data: Partial<AttestationChallenge>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
