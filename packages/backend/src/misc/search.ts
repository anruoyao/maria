import { Notes } from "@/models/index.js";
import type { Note } from "@/models/entities/note.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import type { SelectQueryBuilder } from "typeorm";

export interface SearchParams {
	withFilesOnly: boolean;
	limit: number;
	myId: string | undefined;
	sinceId: string | undefined;
	untilId: string | undefined;
	sinceDate: number | undefined;
	untilDate: number | undefined;
	userId: string | null | undefined;
	channelId: string | null;
	host: string | null | undefined;
}

export async function searchNotes(
	params: SearchParams,
	modifier?: (query: SelectQueryBuilder<Note>) => void,
): Promise<Note[]> {
	const query = makePaginationQuery(
		Notes.createQueryBuilder("note"),
		params.sinceId ?? undefined,
		params.untilId ?? undefined,
		params.sinceDate ?? undefined,
		params.untilDate ?? undefined,
	);
	modifier?.(query);

	if (params.userId != null) {
		query.andWhere("note.userId = :userId", { userId: params.userId });
	}

	if (params.channelId != null) {
		query.andWhere("note.channelId = :channelId", {
			channelId: params.channelId,
		});
	}

	query.innerJoinAndSelect("note.user", "user");

	// "from: me": search all (public, home, followers, specified) my posts
	//  otherwise: search public indexable posts only
	if (params.userId == null || params.userId !== params.myId) {
		query
			.andWhere("note.visibility = 'public'")
			.andWhere("user.isIndexable = TRUE");
	}

	if (params.userId != null) {
		query.andWhere("note.userId = :userId", { userId: params.userId });
	}

	if (params.host === null) {
		// search local notes only
		query.andWhere("note.userHost IS NULL");
	}
	if (params.host != null) {
		query.andWhere("note.userHost = :userHost", { userHost: params.host });
	}

	if (params.withFilesOnly) {
		query.andWhere("note.fileIds != '{}'");
	}

	query
		.leftJoinAndSelect("user.avatar", "avatar")
		.leftJoinAndSelect("user.banner", "banner")
		.leftJoinAndSelect("note.reply", "reply")
		.leftJoinAndSelect("note.renote", "renote")
		.leftJoinAndSelect("reply.user", "replyUser")
		.leftJoinAndSelect("replyUser.avatar", "replyUserAvatar")
		.leftJoinAndSelect("replyUser.banner", "replyUserBanner")
		.leftJoinAndSelect("renote.user", "renoteUser")
		.leftJoinAndSelect("renoteUser.avatar", "renoteUserAvatar")
		.leftJoinAndSelect("renoteUser.banner", "renoteUserBanner");

	const me = params.myId != null ? { id: params.myId } : null;

	generateVisibilityQuery(query, me);
	if (params.myId != null) generateMutedUserQuery(query, { id: params.myId });
	if (params.myId != null) generateBlockedUserQuery(query, { id: params.myId });

	return await query.take(params.limit).getMany();
}
