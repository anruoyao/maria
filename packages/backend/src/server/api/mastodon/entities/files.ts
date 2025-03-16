import type { MastoContext } from "..";

export type Files = MastoContext["request"]["files"];
type FileOrFileArr = Exclude<Files, undefined>["file"];
export type File = Exclude<FileOrFileArr, FileOrFileArr[]>;
