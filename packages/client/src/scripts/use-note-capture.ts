import type { Ref } from "vue";
import { onUnmounted, ref } from "vue";
import { useStream } from "@/stream";
import { isSignedIn, me } from "@/me";
import * as os from "@/os";
import type { NoteType } from "@/types/note";

export const deletedNoteIds = new Map<NoteType["id"], boolean>();

const noteRefs = new Map<NoteType["id"], Ref<NoteType>[]>();

function addToNoteRefs(note: Ref<NoteType>) {
	const refs = noteRefs.get(note.value.id);
	if (refs) {
		refs.push(note);
	} else {
		noteRefs.set(note.value.id, [note]);
	}
}

function eachNote(id: NoteType["id"], cb: (note: Ref<NoteType>) => void) {
	const refs = noteRefs.get(id);
	if (refs) {
		for (const n of refs) {
			// n.value.id maybe changed
			if (n.value.id === id) {
				cb(n);
			}
		}
	}
}

export function useNoteCapture(props: {
	rootEl: Ref<HTMLElement | null>;
	note: Ref<NoteType>;
	isDeletedRef?: Ref<boolean>;
	onReplied?: (note: NoteType) => void;
}) {
	let closed = false;
	const note = props.note;
	const connection = isSignedIn(me) ? useStream() : null;
	addToNoteRefs(note);

	function onDeleted() {
		if (props.isDeletedRef) props.isDeletedRef.value = true;
		deletedNoteIds.set(note.value.id, true);

		if (note.value.replyId) {
			eachNote(note.value.replyId, (n) => n.value.repliesCount--);
		}
		if (note.value.renoteId) {
			eachNote(note.value.renoteId, (n) => n.value.renoteCount--);
		}
	}

	async function onStreamNoteUpdated(noteData): Promise<void> {
		const { type, id, body } = noteData;

		if (closed) return;
		if (id !== note.value.id) return;

		switch (type) {
			case "replied": {
				note.value.repliesCount += 1;
				if (props.onReplied) {
					const { id: createdId } = body;
					const replyNote = await os.api("notes/show", {
						noteId: createdId,
					});
					props.onReplied(replyNote);
				}
				break;
			}
			case "reacted": {
				const reaction = body.reaction;

				if (body.emoji) {
					const emojis = note.value.emojis || [];
					if (!emojis.includes(body.emoji)) {
						note.value.emojis = [...emojis, body.emoji];
					}
				}

				// TODO: reactionsプロパティがない場合ってあったっけ？ なければ || {} は消せる
				const currentCount = note.value.reactions?.[reaction] || 0;

				note.value.reactions[reaction] = currentCount + 1;

				if (isSignedIn(me) && body.userId === me.id) {
					note.value.myReaction = reaction;
				}
				break;
			}

			case "unreacted": {
				const reaction = body.reaction;

				// TODO: reactionsプロパティがない場合ってあったっけ？ なければ || {} は消せる
				const currentCount = note.value.reactions?.[reaction] || 0;

				note.value.reactions[reaction] = Math.max(0, currentCount - 1);

				if (isSignedIn(me) && body.userId === me.id) {
					note.value.myReaction = undefined;
				}
				break;
			}

			case "pollVoted": {
				const choice = body.choice;

				if (note.value.poll) {
					const choices = [...note.value.poll.choices];
					choices[choice] = {
						...choices[choice],
						votes: choices[choice].votes + 1,
						...(isSignedIn(me) && body.userId === me.id
							? {
									isVoted: true,
								}
							: {}),
					};
					note.value.poll.choices = choices;
				}

				break;
			}

			case "deleted": {
				onDeleted();
				break;
			}

			case "updated": {
				try {
					const editedNote = await os.api("notes/show", {
						noteId: id,
					});
					for (const key of [
						...new Set(Object.keys(editedNote).concat(Object.keys(note.value))),
					]) {
						note.value[key] = editedNote[key];
					}
				} catch {
					// delete the note if failing to get the edited note
					onDeleted();
				}
				break;
			}
		}
	}

	function capture(withHandler = false): void {
		if (connection) {
			// TODO: このノートがストリーミング経由で流れてきた場合のみ sr する
			connection.send(document.body.contains(props.rootEl.value) ? "sr" : "s", {
				id: note.value.id,
			});
			if (withHandler) connection.on("noteUpdated", onStreamNoteUpdated);
		}
	}

	function decapture(withHandler = false): void {
		if (connection) {
			connection.send("un", {
				id: note.value.id,
			});
			if (withHandler) connection.off("noteUpdated", onStreamNoteUpdated);
		}
	}

	function onStreamConnected() {
		capture(false);
	}

	capture(true);
	if (connection) {
		connection.on("_connected_", onStreamConnected);
	}

	onUnmounted(() => {
		decapture(true);
		if (connection) {
			connection.off("_connected_", onStreamConnected);
		}
	});

	return {
		close: () => {
			closed = true;
		},
	};
}
