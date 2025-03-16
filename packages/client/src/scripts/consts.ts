import { noteVisibilities } from "firefish-js";
import type { NoteVisibility } from "@/types/note";

export const noteVisibilitiesClient = (
	noteVisibilities as readonly NoteVisibility[]
).concat("private");
