import { Brackets, type SelectQueryBuilder } from "typeorm";
import type { User } from "@/models/entities/user.js";
import { ReplyMutings } from "@/models/index.js";

export function generateMutedUserRepliesQueryForNotes(
	q: SelectQueryBuilder<any>,
	me: { id: User["id"] },
): void {
	const mutingQuery = ReplyMutings.createQueryBuilder("reply_muting")
		.select("reply_muting.muteeId")
		.where("reply_muting.muterId = :muterId", { muterId: me.id });

	q.andWhere(
		new Brackets((qb) => {
			qb.where(
				new Brackets((qb) => {
					qb.where("note.replyId IS NOT NULL");
					qb.andWhere(`note.userId NOT IN (${mutingQuery.getQuery()})`);
				}),
			).orWhere("note.replyId IS NULL");
		}),
	);

	q.setParameters(mutingQuery.getParameters());
}
