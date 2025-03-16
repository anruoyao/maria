import create from "@/services/note/create.js";
import { NoteFiles, Users } from "@/models/index.js";
import type { DbUserImportMastoPostJobData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import { uploadFromUrl } from "@/services/drive/upload-from-url.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import type Bull from "bull";
import { createImportCkPostJob } from "@/queue/index.js";
import { Notes, NoteEdits } from "@/models/index.js";
import type { Note } from "@/models/entities/note.js";
import { genId } from "backend-rs";
import { noteVisibilities } from "@/types.js";

const logger = queueLogger.createSubLogger("import-firefish-post");

export async function importCkPost(
	job: Bull.Job<DbUserImportMastoPostJobData>,
	done: any,
): Promise<void> {
	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		done();
		return;
	}
	const post = job.data.post;
	/*
	if (post.replyId != null) {
		done();
		return;
	}
	if (post.renoteId != null) {
		done();
		return;
	}
	if (post.visibility !== "public") {
		done();
		return;
	}
	*/
	const urls = (post.files || [])
		.map((x: any) => x.url)
		.filter((x: string) => x.startsWith("http"));
	const files: DriveFile[] = [];
	for (const url of urls) {
		try {
			const file = await uploadFromUrl({
				url: url,
				user: user,
			});
			files.push(file);
		} catch (e) {
			logger.info(`Skipped adding file to drive: ${url}`);
		}
	}

	const createdAt = new Date(post.createdAt);
	const visibility = noteVisibilities.includes(post.visibility)
		? post.visibility
		: "specified";

	let note = await Notes.findOneBy({
		createdAt,
		text: post.text || undefined,
		userId: user.id,
	});

	// If an import is completely successful at once, the order should not be out of order.
	// If it takes multiple imports to complete, the order is not guaranteed to be consistent.
	if (note != null && files.length > 0) {
		const addFiles: DriveFile[] = [];
		for (const file of files) {
			if (!note.fileIds.includes(file.id)) {
				addFiles.push(file);
			}
		}

		const update: Partial<Note> = {};
		update.fileIds = addFiles.map((x) => x.id);

		if (update.fileIds != null) {
			await NoteFiles.insert(
				update.fileIds.map((fileId) => ({ noteId: note?.id, fileId })),
			);
		}

		update.fileIds = note.fileIds.concat(update.fileIds);

		await Notes.update(note.id, update);
		await NoteEdits.insert({
			id: genId(),
			noteId: note.id,
			text: note.text || undefined,
			cw: note.cw,
			fileIds: note.fileIds,
			updatedAt: new Date(),
		});
		logger.info("Post updated");
	}
	if (note == null) {
		note = await create(
			user,
			{
				createdAt,
				scheduledAt: undefined,
				files: files.length === 0 ? undefined : files,
				poll: undefined,
				text: post.text || undefined,
				reply: post.replyId ? job.data.parent : null,
				renote: post.renoteId ? job.data.parent : null,
				cw: post.cw,
				localOnly: post.localOnly,
				visibility,
				visibleUsers: [],
				channel: null,
				apMentions: new Array(0),
				apHashtags: undefined,
				apEmojis: undefined,
			},
			false,
			undefined,
			true,
		);
		logger.debug("New post has been created");
	} else {
		logger.info("This post already exists");
	}
	logger.info("Imported");
	if (post.childNotes) {
		for (const child of post.childNotes) {
			createImportCkPostJob(
				job.data.user,
				child,
				job.data.signatureCheck,
				note,
			);
		}
	}
	done();
}
