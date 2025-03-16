import type Bull from "bull";

import { queueLogger } from "../../logger.js";
import { resolveUser } from "@/remote/resolve-user.js";
import { pushUserToUserList } from "@/services/user-list/push.js";
import { downloadTextFile } from "@/misc/download-text-file.js";
import {
	DriveFiles,
	Users,
	UserLists,
	UserListJoinings,
} from "@/models/index.js";
import { genIdAt, isSelfHost, stringToAcct, toPuny } from "backend-rs";
import type { DbUserImportJobData } from "@/queue/types.js";
import { IsNull } from "typeorm";
import { inspect } from "node:util";

const logger = queueLogger.createSubLogger("import-user-lists");

export async function importUserLists(
	job: Bull.Job<DbUserImportJobData>,
	done: any,
): Promise<void> {
	logger.info(`Importing user lists of ${job.data.user.id} ...`);

	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		done();
		return;
	}

	const file = await DriveFiles.findOneBy({
		id: job.data.fileId,
	});
	if (file == null) {
		done();
		return;
	}

	const csv = await downloadTextFile(file.url);

	let linenum = 0;

	for (const line of csv.trim().split("\n")) {
		linenum++;

		try {
			const listName = line.split(",")[0].trim();
			const { username, host } = stringToAcct(line.split(",")[1].trim());

			let list = await UserLists.findOneBy({
				userId: user.id,
				name: listName,
			});

			if (list == null) {
				const now = new Date();
				list = await UserLists.insert({
					id: genIdAt(now),
					createdAt: now,
					userId: user.id,
					name: listName,
				}).then((x) => UserLists.findOneByOrFail(x.identifiers[0]));
			}

			let target = isSelfHost(host!)
				? await Users.findOneBy({
						host: IsNull(),
						usernameLower: username.toLowerCase(),
					})
				: await Users.findOneBy({
						host: toPuny(host!),
						usernameLower: username.toLowerCase(),
					});

			if (target == null) {
				target = await resolveUser(username, host);
			}

			if (
				(await UserListJoinings.findOneBy({
					userListId: list!.id,
					userId: target.id,
				})) != null
			)
				continue;

			pushUserToUserList(target, list!);
		} catch (e) {
			logger.warn(`Error in line ${linenum}`);
			logger.info(inspect(e));
		}
	}

	logger.info("Imported");
	done();
}
