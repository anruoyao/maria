import { addFile } from "@/services/drive/add-file.js";
import type { ILocalUser } from "@/models/entities/user.js";
import { DriveFiles } from "@/models/index.js";
import type { Packed } from "@/misc/schema.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import type { MastoContext } from "@/server/api/mastodon/index.js";
import { toSingleLast } from "@/prelude/array.js";
import * as fs from "node:fs";
import type { File } from "@/server/api/mastodon/entities/files.js";

export class MediaHelpers {
	public static async uploadMedia(
		ctx: MastoContext,
	): Promise<Packed<"DriveFile">> {
		const files = ctx.request.files;
		const file = toSingleLast(files?.file);
		const user = ctx.user as ILocalUser;
		const body = ctx.request.body;
		let description: string | undefined = body?.description ?? undefined;

		if (!description && files?.description) {
			const path = toSingleLast(files?.description)?.filepath;
			if (path) {
				description = fs.readFileSync(path, "utf-8");
			}
		}

		if (!file)
			throw new MastoApiError(
				400,
				"Validation failed: File content type is invalid, File is invalid",
			);

		return addFile({
			user: user,
			path: file.filepath,
			name:
				file.originalFilename !== null && file.originalFilename !== "file"
					? file.originalFilename
					: undefined,
			comment: description ?? undefined,
			sensitive: false, // FIXME: this needs to be updated on from composing a post with the media attached
		}).then((p) => DriveFiles.pack(p));
	}

	public static async uploadMediaBasic(
		file: File,
		ctx: MastoContext,
	): Promise<DriveFile> {
		const user = ctx.user as ILocalUser;

		return addFile({
			user: user,
			path: file.filepath,
			name:
				file.originalFilename !== null && file.originalFilename !== "file"
					? file.originalFilename
					: undefined,
			sensitive: false,
		});
	}

	public static async updateMedia(
		file: DriveFile,
		ctx: MastoContext,
	): Promise<Packed<"DriveFile">> {
		const user = ctx.user as ILocalUser;
		const body = ctx.request.body as any;

		await DriveFiles.update(file.id, {
			comment: body?.description ?? undefined,
		});

		return DriveFiles.findOneByOrFail({ id: file.id, userId: user.id }).then(
			(p) => DriveFiles.pack(p),
		);
	}

	public static async getMediaPacked(
		id: string,
		ctx: MastoContext,
	): Promise<Packed<"DriveFile"> | null> {
		const user = ctx.user as ILocalUser;
		return this.getMedia(id, ctx).then((p) => (p ? DriveFiles.pack(p) : null));
	}

	public static async getMediaPackedOr404(
		id: string,
		ctx: MastoContext,
	): Promise<Packed<"DriveFile">> {
		return this.getMediaPacked(id, ctx).then((p) => {
			if (p) return p;
			throw new MastoApiError(404);
		});
	}

	public static async getMedia(
		id: string,
		ctx: MastoContext,
	): Promise<DriveFile | null> {
		const user = ctx.user as ILocalUser;
		return DriveFiles.findOneBy({ id: id, userId: user.id });
	}

	public static async getMediaOr404(
		id: string,
		ctx: MastoContext,
	): Promise<DriveFile> {
		return this.getMedia(id, ctx).then((p) => {
			if (p) return p;
			throw new MastoApiError(404);
		});
	}
}
