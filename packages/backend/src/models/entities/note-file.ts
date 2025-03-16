import {
	Entity,
	Index,
	Column,
	ManyToOne,
	PrimaryGeneratedColumn,
	type Relation,
} from "typeorm";
import { Note } from "./note.js";
import { DriveFile } from "./drive-file.js";
import { id } from "../id.js";

@Entity()
export class NoteFile {
	@PrimaryGeneratedColumn("increment")
	public serialNo: number;

	@Index("IDX_note_file_noteId", { unique: false })
	@Column({
		...id(),
		nullable: false,
	})
	public noteId: Note["id"];

	@Index("IDX_note_file_fileId", { unique: false })
	@Column({
		...id(),
		nullable: false,
	})
	public fileId: DriveFile["id"];

	//#region Relations
	@ManyToOne(
		() => Note,
		(note: Note) => note.noteFiles,
	)
	public note: Relation<Note>;

	@ManyToOne(
		() => DriveFile,
		(file: DriveFile) => file.noteFiles,
	)
	public file: Relation<DriveFile>;
	//#endregion Relations
}
