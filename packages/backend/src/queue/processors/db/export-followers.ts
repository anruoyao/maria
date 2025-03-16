import type Bull from "bull";
import * as fs from "node:fs";

import { queueLogger } from "../../logger.js";
import { addFile } from "@/services/drive/add-file.js";
import { format as dateFormat } from "date-fns";
import { getFullApAccount } from "backend-rs";
import { createTemp } from "@/misc/create-temp.js";
import { Users, Followings, Mutings } from "@/models/index.js";
import { In, MoreThan, Not } from "typeorm";
import type { DbUserJobData } from "@/queue/types.js";
import type { Following } from "@/models/entities/following.js";
import { inspect } from "node:util";

const logger = queueLogger.createSubLogger("export-followers");

export async function exportFollowers(
	job: Bull.Job<DbUserJobData>,
	done: () => void,
): Promise<void> {
	logger.info(`Exporting followers of ${job.data.user.id} ...`);

	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		done();
		return;
	}

	// Create temp file
	const [path, cleanup] = await createTemp();

	logger.info(`temp file created: ${path}`);

	try {
		const stream = fs.createWriteStream(path, { flags: "a" });

		let cursor: Following["id"] | null = null;

		const mutings = job.data.excludeMuting
			? await Mutings.findBy({
					muterId: user.id,
				})
			: [];

		while (true) {
			const followers = (await Followings.find({
				where: {
					followeeId: user.id,
					...(mutings.length > 0
						? { followerId: Not(In(mutings.map((x) => x.muteeId))) }
						: {}),
					...(cursor ? { id: MoreThan(cursor) } : {}),
				},
				take: 100,
				order: {
					id: 1,
				},
			})) as Following[];

			if (followers.length === 0) {
				break;
			}

			cursor = followers[followers.length - 1].id;

			for (const follower of followers) {
				const u = await Users.findOneBy({ id: follower.followerId });
				if (u == null) {
					continue;
				}

				if (
					job.data.excludeInactive &&
					u.updatedAt &&
					Date.now() - u.updatedAt.getTime() > 1000 * 60 * 60 * 24 * 90
				) {
					continue;
				}

				const content = getFullApAccount(u.username, u.host);
				await new Promise<void>((res, rej) => {
					stream.write(`${content}\n`, (err) => {
						if (err) {
							logger.warn(`failed to export followers of ${job.data.user.id}`);
							logger.info(inspect(err));
							rej(err);
						} else {
							res();
						}
					});
				});
			}
		}

		stream.end();
		logger.info(`Exported to: ${path}`);

		const fileName = `followers-${dateFormat(
			new Date(),
			"yyyy-MM-dd-HH-mm-ss",
		)}.csv`;
		const driveFile = await addFile({
			user,
			path,
			name: fileName,
			force: true,
		});

		logger.info(`Exported to: ${driveFile.id}`);
	} finally {
		cleanup();
	}

	done();
}
