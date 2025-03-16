import { Brackets, type SelectQueryBuilder } from "typeorm";
import type { User } from "@/models/entities/user.js";
import { UserListJoinings, UserLists } from "@/models/index.js";

export function generateListQuery(
	q: SelectQueryBuilder<any>,
	me: { id: User["id"] },
): void {
	const listQuery = UserLists.createQueryBuilder("list")
		.select("list.id")
		.andWhere("list.userId = :meId");

	const memberQuery = UserListJoinings.createQueryBuilder("member")
		.select("member.userId")
		.where(`member.userListId IN (${listQuery.getQuery()})`);

	q.andWhere(
		new Brackets((qb) => {
			qb.where("note.userId = :meId");
			qb.orWhere(`note.userId NOT IN (${memberQuery.getQuery()})`);
		}),
	);

	q.setParameters({ meId: me.id });
}
