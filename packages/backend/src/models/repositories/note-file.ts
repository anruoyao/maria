import { db } from "@/db/postgre.js";
import { NoteFile } from "@/models/entities/note-file.js";

export const NoteFileRepository = db.getRepository(NoteFile).extend({});
