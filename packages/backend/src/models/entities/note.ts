import {
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	Column,
	PrimaryColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { DriveFile } from "./drive-file.js";
import { id } from "../id.js";
import { noteVisibilities } from "../../types.js";
import { Channel } from "./channel.js";
import { NoteFile } from "./note-file.js";

@Entity()
@Index("IDX_NOTE_TAGS", { synchronize: false })
@Index("IDX_NOTE_MENTIONS", { synchronize: false })
@Index("IDX_NOTE_VISIBLE_USER_IDS", { synchronize: false })
export class Note {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the Note.",
	})
	public createdAt: Date;

	@Column("timestamp with time zone", {
		nullable: true,
	})
	public scheduledAt: Date | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The ID of reply target.",
	})
	public replyId: Note["id"] | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The ID of renote target.",
	})
	public renoteId: Note["id"] | null;

	@Index()
	@Column("varchar", {
		length: 256,
		nullable: true,
	})
	public threadId: string | null;

	@Index() // USING pgroonga
	@Column("text", {
		nullable: true,
	})
	public text: string | null;

	@Column("varchar", {
		length: 10,
		nullable: true,
	})
	public lang: string | null;

	@Column("varchar", {
		length: 256,
		nullable: true,
	})
	public name: string | null;

	@Index() // USING pgroonga
	@Column("text", {
		nullable: true,
	})
	public cw: string | null;

	@Index()
	@Column({
		...id(),
		comment: "The ID of author.",
	})
	public userId: User["id"];

	@Column("boolean", {
		default: false,
	})
	public localOnly: boolean;

	@Column("smallint", {
		default: 0,
	})
	public renoteCount: number;

	@Column("smallint", {
		default: 0,
	})
	public repliesCount: number;

	@Column("jsonb", {
		default: {},
	})
	public reactions: Record<string, number>;

	/**
	 * public ... 公開
	 * home ... ホームタイムライン(ユーザーページのタイムライン含む)のみに流す
	 * hidden ... only visible on profile (doesnt federate, like local only, but can be fetched via AP like home) <- for now only used for post imports
	 * followers ... フォロワーのみ
	 * specified ... visibleUserIds で指定したユーザーのみ
	 */
	@Column("enum", { enum: noteVisibilities })
	public visibility: (typeof noteVisibilities)[number];

	@Index({ unique: true })
	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "The URI of a note. it will be null when the note is local.",
	})
	public uri: string | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment:
			"The human readable url of a note. it will be null when the note is local.",
	})
	public url: string | null;

	@Column("integer", {
		default: 0,
	})
	public score: number;

	// FIXME: file id is not removed from this array even if the file is deleted
	// TODO: drop this column and use note_files
	@Column({
		...id(),
		array: true,
		default: "{}",
	})
	public fileIds: DriveFile["id"][];

	@Column("varchar", {
		length: 256,
		array: true,
		default: "{}",
	})
	public attachedFileTypes: string[];

	@Index()
	@Column({
		...id(),
		array: true,
		default: "{}",
	})
	public visibleUserIds: User["id"][];

	@Column({
		...id(),
		array: true,
		default: "{}",
	})
	public mentions: User["id"][];

	// FIXME: WHAT IS THIS
	@Column("text", {
		default: "[]",
	})
	public mentionedRemoteUsers: string;

	@Column("varchar", {
		length: 128,
		array: true,
		default: "{}",
	})
	public emojis: string[];

	@Column("varchar", {
		length: 128,
		array: true,
		default: "{}",
	})
	public tags: string[];

	@Column("boolean", {
		default: false,
	})
	public hasPoll: boolean;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The ID of source channel.",
	})
	public channelId: Channel["id"] | null;

	//#region Denormalized fields
	@Index()
	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public userHost: string | null;

	@Column({
		...id(),
		nullable: true,
		comment: "[Denormalized]",
	})
	public replyUserId: User["id"] | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public replyUserHost: string | null;

	@Column({
		...id(),
		nullable: true,
		comment: "[Denormalized]",
	})
	public renoteUserId: User["id"] | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public renoteUserHost: string | null;

	@Column("timestamp with time zone", {
		nullable: true,
		comment: "The updated date of the Note.",
	})
	public updatedAt: Date | null;
	//#endregion

	//#region Relations
	@OneToMany(
		() => NoteFile,
		(noteFile: NoteFile) => noteFile.note,
	)
	public noteFiles: Relation<NoteFile[]>;

	@ManyToMany(
		() => DriveFile,
		(file: DriveFile) => file.notes,
	)
	@JoinTable({
		name: "note_file",
		joinColumn: {
			name: "noteId",
			referencedColumnName: "id",
		},
		inverseJoinColumn: {
			name: "fileId",
			referencedColumnName: "id",
		},
	})
	public files: Relation<DriveFile[]>;

	@ManyToOne(() => Note, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public reply: Relation<Note | null>;

	@ManyToOne(() => Note, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public renote: Relation<Note | null>;

	@ManyToOne(() => Channel, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public channel: Relation<Channel | null>;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public user: Relation<User | null>;
	//#endregion Relations

	constructor(data: Partial<Note>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}

export type IMentionedRemoteUser = {
	uri: string;
	url?: string;
	username: string;
	host: string;
};

export type IMentionedRemoteUsers = IMentionedRemoteUser[];
