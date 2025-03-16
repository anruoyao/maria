import {
	packedUserLiteSchema,
	packedUserDetailedNotMeOnlySchema,
	packedMeDetailedOnlySchema,
	packedUserDetailedNotMeSchema,
	packedMeDetailedSchema,
	packedUserDetailedSchema,
	packedUserSchema,
} from "../schema/user.js";
import { packedNoteSchema } from "../schema/note.js";
import { packedUserListSchema } from "../schema/user-list.js";
import { packedAppSchema } from "../schema/app.js";
import { packedMessagingMessageSchema } from "../schema/messaging-message.js";
import { packedNotificationSchema } from "../schema/notification.js";
import { packedDriveFileSchema } from "../schema/drive-file.js";
import { packedDriveFolderSchema } from "../schema/drive-folder.js";
import { packedFollowingSchema } from "../schema/following.js";
import { packedMutingSchema } from "../schema/muting.js";
import { packedRenoteMutingSchema } from "../schema/renote-muting.js";
import { packedReplyMutingSchema } from "../schema/reply-muting.js";
import { packedBlockingSchema } from "../schema/blocking.js";
import { packedNoteReactionSchema } from "../schema/note-reaction.js";
import { packedHashtagSchema } from "../schema/hashtag.js";
import { packedPageSchema } from "../schema/page.js";
import { packedUserGroupSchema } from "../schema/user-group.js";
import { packedNoteFavoriteSchema } from "../schema/note-favorite.js";
import { packedChannelSchema } from "../schema/channel.js";
import { packedAntennaSchema } from "../schema/antenna.js";
import { packedClipSchema } from "../schema/clip.js";
import { packedFederationInstanceSchema } from "../schema/federation-instance.js";
import { packedQueueCountSchema } from "../schema/queue.js";
import { packedGalleryPostSchema } from "../schema/gallery-post.js";
import { packedEmojiSchema } from "../schema/emoji.js";
import { packedNoteEdit } from "../schema/note-edit.js";
import { packedNoteFileSchema } from "../schema/note-file.js";
import { packedAbuseUserReportSchema } from "../schema/abuse-user-report.js";

export const refs = {
	AbuseUserReport: packedAbuseUserReportSchema,
	UserLite: packedUserLiteSchema,
	UserDetailedNotMeOnly: packedUserDetailedNotMeOnlySchema,
	MeDetailedOnly: packedMeDetailedOnlySchema,
	UserDetailedNotMe: packedUserDetailedNotMeSchema,
	MeDetailed: packedMeDetailedSchema,
	UserDetailed: packedUserDetailedSchema,
	User: packedUserSchema,

	UserList: packedUserListSchema,
	UserGroup: packedUserGroupSchema,
	App: packedAppSchema,
	MessagingMessage: packedMessagingMessageSchema,
	Note: packedNoteSchema,
	NoteFile: packedNoteFileSchema,
	NoteEdit: packedNoteEdit,
	NoteReaction: packedNoteReactionSchema,
	NoteFavorite: packedNoteFavoriteSchema,
	Notification: packedNotificationSchema,
	DriveFile: packedDriveFileSchema,
	DriveFolder: packedDriveFolderSchema,
	Following: packedFollowingSchema,
	Muting: packedMutingSchema,
	RenoteMuting: packedRenoteMutingSchema,
	ReplyMuting: packedReplyMutingSchema,
	Blocking: packedBlockingSchema,
	Hashtag: packedHashtagSchema,
	Page: packedPageSchema,
	Channel: packedChannelSchema,
	QueueCount: packedQueueCountSchema,
	Antenna: packedAntennaSchema,
	Clip: packedClipSchema,
	FederationInstance: packedFederationInstanceSchema,
	GalleryPost: packedGalleryPostSchema,
	Emoji: packedEmojiSchema,
};

// biome-ignore lint/suspicious/noExplicitAny: used it intentially
type ExplicitlyUsedAny = any;

export type Packed<x extends keyof typeof refs> = SchemaType<(typeof refs)[x]>;

type TypeStringef =
	| "null"
	| "boolean"
	| "integer"
	| "number"
	| "string"
	| "array"
	| "object"
	| "any";
type StringDefToType<T extends TypeStringef> = T extends "null"
	? null
	: T extends "boolean"
		? boolean
		: T extends "integer"
			? number
			: T extends "number"
				? number
				: T extends "string"
					? string | Date
					: T extends "array"
						? ReadonlyArray<ExplicitlyUsedAny>
						: T extends "object"
							? Record<string, ExplicitlyUsedAny>
							: ExplicitlyUsedAny;

// https://swagger.io/specification/?sbsearch=optional#schema-object
type OfSchema = {
	readonly anyOf?: ReadonlyArray<Schema>;
	readonly oneOf?: ReadonlyArray<Schema>;
	readonly allOf?: ReadonlyArray<Schema>;
};

export interface Schema extends OfSchema {
	readonly type?: TypeStringef;
	readonly nullable?: boolean;
	readonly optional?: boolean;
	readonly items?: Schema;
	readonly properties?: Obj;
	readonly required?: ReadonlyArray<
		Extract<keyof NonNullable<this["properties"]>, string>
	>;
	readonly description?: string;
	readonly example?: ExplicitlyUsedAny;
	readonly format?: string;
	readonly ref?: keyof typeof refs;
	readonly enum?: ReadonlyArray<string>;
	readonly default?:
		| (this["type"] extends TypeStringef
				? StringDefToType<this["type"]>
				: ExplicitlyUsedAny)
		| null;
	readonly maxLength?: number;
	readonly minLength?: number;
	readonly maximum?: number;
	readonly minimum?: number;
	readonly pattern?: string;
}

type RequiredPropertyNames<s extends Obj> = {
	[K in keyof s]: // K is not optional
	s[K]["optional"] extends false
		? K
		: // K has default value
			s[K]["default"] extends
					| null
					| string
					| number
					| boolean
					| Record<string, unknown>
			? K
			: never;
}[keyof s];

export type Obj = Record<string, Schema>;

// https://github.com/misskey-dev/misskey/issues/8535
// To avoid excessive stack depth error,
// deceive TypeScript with UnionToIntersection (or more precisely, `infer` expression within it).
export type ObjType<
	s extends Obj,
	RequiredProps extends keyof s,
> = UnionToIntersection<
	{
		-readonly [R in RequiredPropertyNames<s>]-?: SchemaType<s[R]>;
	} & {
		-readonly [R in RequiredProps]-?: SchemaType<s[R]>;
	} & {
		-readonly [P in keyof s]?: SchemaType<s[P]>;
	}
>;

type NullOrUndefined<p extends Schema, T> =
	| (p["nullable"] extends true ? null : never)
	| (p["optional"] extends true ? undefined : never)
	| T;

// https://stackoverflow.com/questions/54938141/typescript-convert-union-to-intersection
// Get intersection from union
type UnionToIntersection<U> = (
	U extends ExplicitlyUsedAny
		? (k: U) => void
		: never
) extends (k: infer I) => void
	? I
	: never;

// https://github.com/misskey-dev/misskey/pull/8144#discussion_r785287552
// To get union, we use `Foo extends ExplicitlyUsedAny ? Hoge<Foo> : never`
type UnionSchemaType<
	a extends readonly ExplicitlyUsedAny[],
	X extends Schema = a[number],
> = X extends ExplicitlyUsedAny ? SchemaType<X> : never;
type ArrayUnion<T> = T extends ExplicitlyUsedAny ? Array<T> : never;

export type SchemaTypeDef<p extends Schema> = p["type"] extends "null"
	? null
	: p["type"] extends "integer"
		? number
		: p["type"] extends "number"
			? number
			: p["type"] extends "string"
				? p["enum"] extends readonly string[]
					? p["enum"][number]
					: p["format"] extends "date-time"
						? string
						: // Dateにする？？
							string
				: p["type"] extends "boolean"
					? boolean
					: p["type"] extends "object"
						? p["ref"] extends keyof typeof refs
							? Packed<p["ref"]>
							: p["properties"] extends NonNullable<Obj>
								? ObjType<p["properties"], NonNullable<p["required"]>[number]>
								: p["anyOf"] extends ReadonlyArray<Schema>
									? UnionSchemaType<p["anyOf"]> &
											Partial<UnionToIntersection<UnionSchemaType<p["anyOf"]>>>
									: p["allOf"] extends ReadonlyArray<Schema>
										? UnionToIntersection<UnionSchemaType<p["allOf"]>>
										: ExplicitlyUsedAny
						: p["type"] extends "array"
							? p["items"] extends OfSchema
								? p["items"]["anyOf"] extends ReadonlyArray<Schema>
									? UnionSchemaType<NonNullable<p["items"]["anyOf"]>>[]
									: p["items"]["oneOf"] extends ReadonlyArray<Schema>
										? ArrayUnion<
												UnionSchemaType<NonNullable<p["items"]["oneOf"]>>
											>
										: p["items"]["allOf"] extends ReadonlyArray<Schema>
											? UnionToIntersection<
													UnionSchemaType<NonNullable<p["items"]["allOf"]>>
												>[]
											: never
								: p["items"] extends NonNullable<Schema>
									? SchemaTypeDef<p["items"]>[]
									: ExplicitlyUsedAny[]
							: p["oneOf"] extends ReadonlyArray<Schema>
								? UnionSchemaType<p["oneOf"]>
								: ExplicitlyUsedAny;

export type SchemaType<p extends Schema> = NullOrUndefined<p, SchemaTypeDef<p>>;
