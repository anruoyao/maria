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
import { GalleryPost } from "./gallery-post.js";

@Entity()
@Index(["userId", "postId"], { unique: true })
export class GalleryLike {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone")
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@Column(id())
	public postId: GalleryPost["id"];

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => GalleryPost, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public post: Relation<GalleryPost>;
	//#endregion
}
