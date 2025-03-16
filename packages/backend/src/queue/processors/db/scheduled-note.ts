import { Users, Notes, DriveFiles } from "@/models/index.js";
import type { DbUserScheduledNoteData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import type Bull from "bull";
import deleteNote from "@/services/note/delete.js";
import createNote from "@/services/note/create.js";
import { In } from "typeorm";

const logger = queueLogger.createSubLogger("scheduled-post");

export async function scheduledNote(
	job: Bull.Job<DbUserScheduledNoteData>,
	done: () => void,
): Promise<void> {
	logger.info(`Creating: ${job.data.noteId}`);

	const [user, draftNote] = await Promise.all([
		Users.findOneBy({ id: job.data.user.id }),
		Notes.findOneBy({ id: job.data.noteId }),
	]);

	if (user == null) {
		logger.warn(`User ${job.data.user.id} does not exist, aborting`);
		done();
		return;
	}

	if (draftNote == null) {
		logger.warn(`Note ${job.data.noteId} does not exist, aborting`);
		done();
		return;
	}

	if (user.isSuspended) {
		logger.info(
			`Cancelled due to user ${job.data.user.id} being suspended, aborting`,
		);
		await deleteNote(user, draftNote);
		done();
		return;
	}

	const [visibleUsers, reply, renote, files] = await Promise.all([
		job.data.option.visibleUserIds
			? Users.findBy({
					id: In(job.data.option.visibleUserIds),
				})
			: [],
		job.data.option.replyId != null
			? Notes.findOneBy({ id: job.data.option.replyId })
			: undefined,
		job.data.option.renoteId != null
			? Notes.findOneBy({ id: job.data.option.renoteId })
			: undefined,
		DriveFiles.findBy({ id: In(draftNote.fileIds) }),
	]);

	if (job.data.option.replyId != null && reply == null) {
		logger.warn(
			`Note ${job.data.option.replyId} (reply) does not exist, aborting`,
		);
		done();
		return;
	}

	if (job.data.option.renoteId != null && renote == null) {
		logger.warn(
			`Note ${job.data.option.renoteId} (renote) does not exist, aborting`,
		);
		done();
		return;
	}

	// Create scheduled (actual) note
	await createNote(user, {
		createdAt: new Date(),
		scheduledAt: null,
		files,
		poll: job.data.option.poll,
		text: draftNote.text || undefined,
		lang: draftNote.lang,
		reply,
		renote,
		cw: draftNote.cw,
		localOnly: draftNote.localOnly,
		visibility: job.data.option.visibility,
		visibleUsers,
		channel: draftNote.channel,
	});

	// Delete temporal (draft) note
	await deleteNote(user, draftNote);

	logger.info("Success");

	done();
}
