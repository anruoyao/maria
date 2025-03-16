import { db } from "@/db/postgre.js";
import type { Packed } from "@/misc/schema.js";
import { ReplyMuting } from "@/models/entities/reply-muting.js";
import type { User } from "@/models/entities/user.js";
import { awaitAll } from "@/prelude/await-all.js";
import { Users } from "../index.js";

export const ReplyMutingRepository = db.getRepository(ReplyMuting).extend({
	async pack(
		src: ReplyMuting["id"] | ReplyMuting,
		me?: { id: User["id"] } | null | undefined,
	): Promise<Packed<"ReplyMuting">> {
		const muting =
			typeof src === "object" ? src : await this.findOneByOrFail({ id: src });

		return await awaitAll({
			id: muting.id,
			createdAt: muting.createdAt.toISOString(),
			muteeId: muting.muteeId,
			mutee: Users.pack(muting.muteeId, me, {
				detail: true,
			}),
		});
	},

	packMany(mutings: any[], me: { id: User["id"] }) {
		return Promise.all(mutings.map((x) => this.pack(x, me)));
	},
});
