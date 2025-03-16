import type {
	AbuseUserReport,
	Ad,
	Announcement,
	Antenna,
	App,
	AuthSession,
	Blocking,
	Channel,
	Clip,
	DateString,
	DetailedInstanceMetadata,
	DriveFile,
	DriveFolder,
	FollowRequest,
	Following,
	FollowingFolloweePopulated,
	FollowingFollowerPopulated,
	GalleryPost,
	Instance,
	// InstanceMetadata,
	LiteInstanceMetadata,
	MeDetailed,
	MessagingMessage,
	Note,
	NoteEdit,
	NoteFavorite,
	NoteReaction,
	Notification,
	OriginType,
	Page,
	ServerInfo,
	Signin,
	Stats,
	User,
	UserDetailed,
	UserGroup,
	UserList,
	UserLite,
	UserSorting,
} from "./entities.js";

import type * as consts from "./consts";

type TODO = Record<string, any> | null;

type NoParams = Record<string, never>;

type ShowUserReq =
	| { username: string; host?: string | null }
	| { userId: User["id"] };

export type NoteSubmitReq = {
	editId?: null | Note["id"];
	visibility?: (typeof consts.noteVisibilities)[number];
	visibleUserIds?: User["id"][];
	text?: null | string;
	cw?: null | string;
	viaMobile?: boolean;
	localOnly?: boolean;
	fileIds?: DriveFile["id"][];
	replyId?: null | Note["id"];
	renoteId?: null | Note["id"];
	channelId?: null | Channel["id"];
	poll?: null | {
		choices: string[];
		multiple: boolean;
		expiresAt: string | null;
		expiredAfter: number | null;
	};
	lang?: string;
	scheduledAt?: number | null;
};

export type Endpoints = {
	// admin
	"admin/abuse-user-reports": {
		req: {
			limit?: number;
			sinceId?: AbuseUserReport["id"];
			untilId?: AbuseUserReport["id"];
			state?: string;
			reporterOrigin?: OriginType;
			targetUserOrigin?: OriginType;
			forwarded?: boolean;
		};
		res: AbuseUserReport[];
	};
	"admin/delete-all-files-of-a-user": {
		req: { userId: User["id"] };
		res: null;
	};
	"admin/delete-logs": { req: NoParams; res: null };
	"admin/get-index-stats": { req: TODO; res: TODO };
	"admin/get-table-stats": { req: TODO; res: TODO };
	"admin/invite": { req: TODO; res: TODO };
	"admin/logs": { req: TODO; res: TODO };
	"admin/meta": { req: TODO; res: TODO };
	"admin/reset-password": { req: TODO; res: TODO };
	"admin/resolve-abuse-user-report": { req: TODO; res: TODO };
	"admin/resync-chart": { req: TODO; res: TODO };
	"admin/send-email": { req: TODO; res: TODO };
	"admin/server-info": { req: TODO; res: TODO };
	"admin/show-moderation-logs": { req: TODO; res: TODO };
	"admin/show-user": { req: TODO; res: TODO };
	"admin/show-users": { req: TODO; res: User[] };
	"admin/silence-user": { req: TODO; res: TODO };
	"admin/suspend-user": { req: TODO; res: TODO };
	"admin/unsilence-user": { req: TODO; res: TODO };
	"admin/unsuspend-user": { req: TODO; res: TODO };
	"admin/update-meta": { req: TODO; res: TODO };
	"admin/accounts/create": { req: TODO; res: TODO };
	"admin/ad/create": { req: TODO; res: TODO };
	"admin/ad/delete": { req: { id: Ad["id"] }; res: null };
	"admin/ad/list": { req: TODO; res: TODO };
	"admin/ad/update": { req: TODO; res: TODO };
	"admin/announcements/create": { req: TODO; res: TODO };
	"admin/announcements/delete": { req: { id: Announcement["id"] }; res: null };
	"admin/announcements/list": { req: TODO; res: TODO };
	"admin/announcements/update": { req: TODO; res: TODO };
	"admin/drive/clean-remote-files": { req: TODO; res: TODO };
	"admin/drive/cleanup": { req: TODO; res: TODO };
	"admin/drive/files": {
		req: {
			limit?: number;
			sinceId?: DriveFile["id"];
			untilId?: DriveFile["id"];
			userId?: User["id"];
			type?: string;
			origin?: "combined" | "local" | "remote";
			hostname?: string;
		};
		res: DriveFile[];
	};
	"admin/drive/show-file": { req: TODO; res: TODO };
	"admin/emoji/add": { req: TODO; res: TODO };
	"admin/emoji/copy": { req: TODO; res: TODO };
	"admin/emoji/list-remote": { req: TODO; res: TODO };
	"admin/emoji/list": { req: TODO; res: TODO };
	"admin/emoji/remove": { req: TODO; res: TODO };
	"admin/emoji/update": { req: TODO; res: TODO };
	"admin/federation/delete-all-files": { req: { host: string }; res: null };
	"admin/federation/refresh-remote-instance-metadata": { req: TODO; res: TODO };
	"admin/federation/remove-all-following": { req: TODO; res: TODO };
	"admin/federation/update-instance": { req: TODO; res: TODO };
	"admin/moderators/add": { req: TODO; res: TODO };
	"admin/moderators/remove": { req: TODO; res: TODO };
	"admin/promo/create": { req: TODO; res: TODO };
	"admin/queue/clear": { req: TODO; res: TODO };
	"admin/queue/deliver-delayed": { req: TODO; res: TODO };
	"admin/queue/inbox-delayed": { req: TODO; res: TODO };
	"admin/queue/jobs": { req: TODO; res: TODO };
	"admin/queue/stats": { req: TODO; res: TODO };
	"admin/relays/add": { req: TODO; res: TODO };
	"admin/relays/list": { req: TODO; res: TODO };
	"admin/relays/remove": { req: TODO; res: TODO };

	// announcements
	announcements: {
		req: {
			limit?: number;
			withUnreads?: boolean;
			sinceId?: Announcement["id"];
			untilId?: Announcement["id"];
		};
		res: Announcement[];
	};

	// antennas
	"antennas/create": { req: TODO; res: Antenna };
	"antennas/delete": { req: { antennaId: Antenna["id"] }; res: null };
	"antennas/list": { req: NoParams; res: Antenna[] };
	"antennas/notes": {
		req: {
			antennaId: Antenna["id"];
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
		};
		res: Note[];
	};
	"antennas/show": { req: { antennaId: Antenna["id"] }; res: Antenna };
	"antennas/update": { req: TODO; res: Antenna };
	"antennas/mark-read": { req: TODO; res: Antenna };

	// ap
	"ap/get": { req: { uri: string }; res: Record<string, any> };
	"ap/show": {
		req: { uri: string };
		res:
			| {
					type: "Note";
					object: Note;
			  }
			| {
					type: "User";
					object: UserDetailed;
			  };
	};

	// app
	"app/create": { req: TODO; res: App };
	"app/show": { req: { appId: App["id"] }; res: App };

	// auth
	"auth/accept": { req: { token: string }; res: null };
	"auth/session/generate": {
		req: { appSecret: string };
		res: { token: string; url: string };
	};
	"auth/session/show": { req: { token: string }; res: AuthSession };
	"auth/session/userkey": {
		req: { appSecret: string; token: string };
		res: { accessToken: string; user: User };
	};

	// blocking
	"blocking/create": { req: { userId: User["id"] }; res: UserDetailed };
	"blocking/delete": { req: { userId: User["id"] }; res: UserDetailed };
	"blocking/list": {
		req: { limit?: number; sinceId?: Blocking["id"]; untilId?: Blocking["id"] };
		res: Blocking[];
	};

	// channels
	"channels/create": {
		req: {
			name: string;
			description?: string;
			bannerId: DriveFile["id"] | null;
		};
		res: Channel;
	};
	"channels/featured": { req: TODO; res: Channel[] };
	"channels/follow": { req: TODO; res: TODO };
	"channels/followed": { req: TODO; res: Channel[] };
	"channels/owned": { req: TODO; res: Channel[] };
	"channels/pin-note": { req: TODO; res: TODO };
	"channels/show": { req: TODO; res: Channel };
	"channels/timeline": { req: TODO; res: Note[] };
	"channels/unfollow": { req: TODO; res: TODO };
	"channels/update": {
		req: {
			channelId: Channel["id"];
			name: string;
			description?: string;
			bannerId: DriveFile["id"] | null;
		};
		res: Channel;
	};

	// charts
	"charts/active-users": {
		req: { span: "day" | "hour"; limit?: number; offset?: number | null };
		res: {
			local: {
				users: number[];
			};
			remote: {
				users: number[];
			};
		};
	};

	// clips
	"clips/add-note": { req: TODO; res: TODO };
	"clips/create": { req: TODO; res: Clip };
	"clips/delete": { req: { clipId: Clip["id"] }; res: null };
	"clips/list": { req: TODO; res: Clip[] };
	"clips/notes": { req: TODO; res: TODO };
	"clips/show": { req: TODO; res: TODO };
	"clips/update": { req: TODO; res: TODO };

	// drive
	drive: { req: NoParams; res: { capacity: number; usage: number } };
	"drive/files": {
		req: {
			folderId?: DriveFolder["id"] | null;
			type?: DriveFile["type"] | null;
			limit?: number;
			sinceId?: DriveFile["id"];
			untilId?: DriveFile["id"];
		};
		res: DriveFile[];
	};
	"drive/files/attached-notes": { req: TODO; res: Note[] };
	"drive/files/caption-image": {
		req: {
			url: string;
		};
		res: string;
	};
	"drive/files/check-existence": { req: TODO; res: TODO };
	"drive/files/create": { req: TODO; res: TODO };
	"drive/files/delete": { req: { fileId: DriveFile["id"] }; res: null };
	"drive/files/find-by-hash": { req: TODO; res: TODO };
	"drive/files/find": {
		req: { name: string; folderId?: DriveFolder["id"] | null };
		res: DriveFile[];
	};
	"drive/files/show": {
		req: { fileId?: DriveFile["id"]; url?: string };
		res: DriveFile;
	};
	"drive/files/update": {
		req: {
			fileId: DriveFile["id"];
			folderId?: DriveFolder["id"] | null;
			name?: string;
			isSensitive?: boolean;
			comment?: string | null;
		};
		res: DriveFile;
	};
	"drive/files/upload-from-url": {
		req: {
			url: string;
			folderId?: DriveFolder["id"] | null;
			isSensitive?: boolean;
			comment?: string | null;
			marker?: string | null;
			force?: boolean;
		};
		res: null;
	};
	"drive/folders": {
		req: {
			folderId?: DriveFolder["id"] | null;
			limit?: number;
			sinceId?: DriveFile["id"];
			untilId?: DriveFile["id"];
		};
		res: DriveFolder[];
	};
	"drive/folders/create": {
		req: { name?: string; parentId?: DriveFolder["id"] | null };
		res: DriveFolder;
	};
	"drive/folders/delete": { req: { folderId: DriveFolder["id"] }; res: null };
	"drive/folders/find": {
		req: { name: string; parentId?: DriveFolder["id"] | null };
		res: DriveFolder[];
	};
	"drive/folders/show": {
		req: { folderId: DriveFolder["id"] };
		res: DriveFolder;
	};
	"drive/folders/update": {
		req: {
			folderId: DriveFolder["id"];
			name?: string;
			parentId?: DriveFolder["id"] | null;
		};
		res: DriveFolder;
	};
	"drive/stream": {
		req: {
			type?: DriveFile["type"] | null;
			limit?: number;
			sinceId?: DriveFile["id"];
			untilId?: DriveFile["id"];
		};
		res: DriveFile[];
	};

	"email-address/available": {
		req: {
			emailAddress: string;
		};
		res: {
			available?: boolean;
			reason: string | null;
		};
	};

	// endpoint
	endpoint: {
		req: { endpoint: string };
		res: { params: { name: string; type: string }[] };
	};

	// endpoints
	endpoints: { req: NoParams; res: string[] };

	// federation
	"federation/dns": {
		req: { host: string };
		res: {
			a: string[];
			aaaa: string[];
			cname: string[];
			txt: string[];
		};
	};
	"federation/followers": {
		req: {
			host: string;
			limit?: number;
			sinceId?: Following["id"];
			untilId?: Following["id"];
		};
		res: FollowingFolloweePopulated[];
	};
	"federation/following": {
		req: {
			host: string;
			limit?: number;
			sinceId?: Following["id"];
			untilId?: Following["id"];
		};
		res: FollowingFolloweePopulated[];
	};
	"federation/instances": {
		req: {
			host?: string | null;
			blocked?: boolean | null;
			notResponding?: boolean | null;
			suspended?: boolean | null;
			federating?: boolean | null;
			subscribing?: boolean | null;
			publishing?: boolean | null;
			limit?: number;
			offset?: number;
			sort?: (typeof consts.instanceSortParam)[number];
		};
		res: Instance[];
	};
	"federation/show-instance": { req: { host: string }; res: Instance };
	"federation/stats": {
		req: {
			limit?: number;
		};
		res: {
			topSubInstances: Instance[];
			otherFollowersCount: number;
			topPubInstances: Instance[];
			otherFollowingCount: number;
		};
	};
	"federation/update-remote-user": { req: { userId: User["id"] }; res: null };
	"federation/users": {
		req: {
			host: string;
			limit?: number;
			sinceId?: User["id"];
			untilId?: User["id"];
		};
		res: UserDetailed[];
	};

	// following
	"following/create": { req: { userId: User["id"] }; res: User };
	"following/delete": { req: { userId: User["id"] }; res: User };
	"following/requests/accept": { req: { userId: User["id"] }; res: null };
	"following/requests/cancel": { req: { userId: User["id"] }; res: User };
	"following/requests/list": { req: NoParams; res: FollowRequest[] };
	"following/requests/sent": { req: NoParams; res: FollowRequest[] };
	"following/requests/reject": { req: { userId: User["id"] }; res: null };

	// gallery
	"gallery/featured": { req: TODO; res: TODO };
	"gallery/popular": { req: TODO; res: TODO };
	"gallery/posts": { req: TODO; res: TODO };
	"gallery/posts/create": { req: TODO; res: TODO };
	"gallery/posts/delete": { req: { postId: GalleryPost["id"] }; res: null };
	"gallery/posts/like": { req: TODO; res: TODO };
	"gallery/posts/show": {
		req: {
			postId: GalleryPost["id"];
		};
		res: GalleryPost;
	};
	"gallery/posts/unlike": { req: TODO; res: TODO };
	"gallery/posts/update": { req: TODO; res: TODO };

	// games
	"games/reversi/games": { req: TODO; res: TODO };
	"games/reversi/games/show": { req: TODO; res: TODO };
	"games/reversi/games/surrender": { req: TODO; res: TODO };
	"games/reversi/invitations": { req: TODO; res: TODO };
	"games/reversi/match": { req: TODO; res: TODO };
	"games/reversi/match/cancel": { req: TODO; res: TODO };

	// get-online-users-count
	"get-online-users-count": { req: NoParams; res: { count: number } };

	// hashtags
	"hashtags/list": { req: TODO; res: TODO };
	"hashtags/search": { req: TODO; res: TODO };
	"hashtags/show": { req: TODO; res: TODO };
	"hashtags/trend": { req: TODO; res: TODO };
	"hashtags/users": { req: TODO; res: TODO };

	// i
	i: { req: NoParams; res: User };
	"i/apps": { req: TODO; res: TODO };
	"i/authorized-apps": { req: TODO; res: TODO };
	"i/change-password": { req: TODO; res: TODO };
	"i/delete-account": { req: { password: string }; res: null };
	"i/export-blocking": { req: TODO; res: TODO };
	"i/export-following": { req: TODO; res: TODO };
	"i/export-followers": { req: TODO; res: TODO };
	"i/export-mute": { req: TODO; res: TODO };
	"i/export-notes": { req: TODO; res: TODO };
	"i/export-user-lists": { req: TODO; res: TODO };
	"i/favorites": {
		req: {
			limit?: number;
			sinceId?: NoteFavorite["id"];
			untilId?: NoteFavorite["id"];
		};
		res: NoteFavorite[];
	};
	"i/gallery/likes": { req: TODO; res: TODO };
	"i/gallery/posts": {
		req: {
			limit?: number;
			sinceId?: NoteFavorite["id"];
			untilId?: NoteFavorite["id"];
		};
		res: GalleryPost[];
	};
	"i/get-word-muted-notes-count": { req: TODO; res: TODO };
	"i/import-following": { req: TODO; res: TODO };
	"i/import-user-lists": { req: TODO; res: TODO };
	"i/move": { req: TODO; res: TODO };
	"i/known-as": { req: TODO; res: TODO };
	"i/notifications": {
		req: {
			limit?: number;
			sinceId?: Notification["id"];
			untilId?: Notification["id"];
			following?: boolean;
			markAsRead?: boolean;
			includeTypes?: Notification["type"][];
			excludeTypes?: Notification["type"][];
		};
		res: Notification[];
	};
	"i/page-likes": { req: TODO; res: TODO };
	"i/pages": { req: TODO; res: TODO };
	"i/pin": { req: { noteId: Note["id"] }; res: MeDetailed };
	"i/read-all-messaging-messages": { req: TODO; res: TODO };
	"i/read-all-unread-notes": { req: TODO; res: TODO };
	"i/read-announcement": { req: TODO; res: TODO };
	"i/regenerate-token": { req: { password: string }; res: null };
	"i/registry/get-all": { req: { scope?: string[] }; res: Record<string, any> };
	"i/registry/get-detail": {
		req: { key: string; scope?: string[] };
		res: { updatedAt: DateString; value: any };
	};
	"i/registry/get": { req: { key: string; scope?: string[] }; res: any };
	"i/registry/keys-with-type": {
		req: { scope?: string[] };
		res: Record<
			string,
			"null" | "array" | "number" | "string" | "boolean" | "object"
		>;
	};
	"i/registry/keys": { req: { scope?: string[] }; res: string[] };
	"i/registry/remove": { req: { key: string; scope?: string[] }; res: null };
	"i/registry/scopes": { req: NoParams; res: string[][] };
	"i/registry/set": {
		req: { key: string; value: any; scope?: string[] };
		res: null;
	};
	"i/revoke-token": { req: TODO; res: TODO };
	"i/signin-history": {
		req: { limit?: number; sinceId?: Signin["id"]; untilId?: Signin["id"] };
		res: Signin[];
	};
	"i/unpin": { req: { noteId: Note["id"] }; res: MeDetailed };
	"i/update-email": {
		req: {
			password: string;
			email?: string | null;
		};
		res: MeDetailed;
	};
	"i/update": {
		req: {
			name?: string | null;
			description?: string | null;
			lang?: string | null;
			location?: string | null;
			birthday?: string | null;
			avatarId?: DriveFile["id"] | null;
			bannerId?: DriveFile["id"] | null;
			fields?: {
				name: string;
				value: string;
			}[];
			isLocked?: boolean;
			isExplorable?: boolean;
			hideOnlineStatus?: boolean;
			carefulBot?: boolean;
			autoAcceptFollowed?: boolean;
			noCrawle?: boolean;
			preventAiLearning?: boolean;
			isBot?: boolean;
			isCat?: boolean;
			speakAsCat?: boolean;
			readCatLanguage?: boolean;
			injectFeaturedNote?: boolean;
			receiveAnnouncementEmail?: boolean;
			alwaysMarkNsfw?: boolean;
			mutedWords?: string[][];
			mutingNotificationTypes?: Notification["type"][];
			emailNotificationTypes?: string[];
		};
		res: MeDetailed;
	};
	"i/user-group-invites": { req: TODO; res: TODO };
	"i/2fa/done": { req: TODO; res: TODO };
	"i/2fa/key-done": { req: TODO; res: TODO };
	"i/2fa/password-less": { req: TODO; res: TODO };
	"i/2fa/register-key": { req: TODO; res: TODO };
	"i/2fa/register": { req: TODO; res: TODO };
	"i/2fa/update-key": { req: TODO; res: TODO };
	"i/2fa/remove-key": { req: TODO; res: TODO };
	"i/2fa/unregister": { req: TODO; res: TODO };

	// messaging
	"messaging/history": {
		req: { limit?: number; group?: boolean };
		res: MessagingMessage[];
	};
	"messaging/messages": {
		req: {
			userId?: User["id"];
			groupId?: UserGroup["id"];
			limit?: number;
			sinceId?: MessagingMessage["id"];
			untilId?: MessagingMessage["id"];
			markAsRead?: boolean;
		};
		res: MessagingMessage[];
	};
	"messaging/messages/create": {
		req: {
			userId?: User["id"];
			groupId?: UserGroup["id"];
			text?: string;
			fileId?: DriveFile["id"];
		};
		res: MessagingMessage;
	};
	"messaging/messages/delete": {
		req: { messageId: MessagingMessage["id"] };
		res: null;
	};
	"messaging/messages/read": {
		req: { messageId: MessagingMessage["id"] };
		res: null;
	};

	// meta
	meta: {
		req: { detail?: boolean };
		res: {
			$switch: {
				$cases: [
					[{ detail: true }, DetailedInstanceMetadata],
					[{ detail: false }, LiteInstanceMetadata],
					[
						{ detail: boolean },
						LiteInstanceMetadata | DetailedInstanceMetadata,
					],
				];
				$default: LiteInstanceMetadata;
			};
		};
	};

	// miauth
	"miauth/gen-token": { req: TODO; res: TODO };

	// mute
	"mute/create": { req: TODO; res: TODO };
	"mute/delete": { req: { userId: User["id"] }; res: null };
	"mute/list": { req: TODO; res: TODO };
	"renote-mute/create": { req: TODO; res: TODO };
	"renote-mute/delete": { req: { userId: User["id"] }; res: null };
	"renote-mute/list": { req: TODO; res: TODO };
	"reply-mute/create": { req: TODO; res: TODO };
	"reply-mute/delete": { req: { userId: User["id"] }; res: null };
	"reply-mute/list": { req: TODO; res: TODO };

	// my
	"my/apps": { req: TODO; res: TODO };

	// notes
	notes: {
		req: { limit?: number; sinceId?: Note["id"]; untilId?: Note["id"] };
		res: Note[];
	};
	"notes/children": {
		req: {
			noteId: Note["id"];
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
		};
		res: Note[];
	};
	"notes/clips": { req: TODO; res: TODO };
	"notes/conversation": {
		req: {
			noteId: string;
			limit?: number;
			offset?: number;
		};
		res: Note[];
	};
	"notes/create": {
		req: NoteSubmitReq;
		res: { createdNote: Note };
	};
	"notes/delete": { req: { noteId: Note["id"] }; res: null };
	"notes/edit": {
		req: NoteSubmitReq;
		res: { createdNote: Note };
	};
	"notes/favorites/create": { req: { noteId: Note["id"] }; res: null };
	"notes/favorites/delete": { req: { noteId: Note["id"] }; res: null };
	"notes/featured": { req: TODO; res: Note[] };
	"notes/global-timeline": {
		req: {
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	"notes/history": {
		req: {
			noteId: Note["id"];
			limit?: number;
			offset?: number;
		};
		res: NoteEdit[];
	};
	"notes/recommended-timeline": {
		req: {
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	"notes/thread-muting/create": {
		req: {
			noteId: Note["id"];
		};
		res: null;
	};
	"notes/thread-muting/delete": {
		req: {
			noteId: Note["id"];
		};
		res: null;
	};
	"notes/hybrid-timeline": {
		req: {
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	"notes/local-timeline": {
		req: {
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	"notes/make-private": {
		req: {
			noteId: Note["id"];
		};
		res: null;
	};
	"notes/mentions": {
		req: {
			following?: boolean;
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
		};
		res: Note[];
	};
	"notes/polls/recommendation": { req: TODO; res: TODO };
	"notes/polls/vote": {
		req: { noteId: Note["id"]; choice: number };
		res: null;
	};
	"notes/reactions": {
		req: {
			noteId: Note["id"];
			type?: string | null;
			limit?: number;
			offset?: number;
		};
		res: NoteReaction[];
	};
	"notes/reactions/create": {
		req: { noteId: Note["id"]; reaction: string };
		res: null;
	};
	"notes/reactions/delete": { req: { noteId: Note["id"] }; res: null };
	"notes/renotes": {
		req: {
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			noteId: Note["id"];
			filter?: "all" | "renote" | "quote";
		};
		res: Note[];
	};
	"notes/replies": {
		req: {
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			noteId: Note["id"];
		};
		res: Note[];
	};
	"notes/search-by-tag": { req: TODO; res: TODO };
	"notes/search": {
		req: {
			query: string;
			sinceId?: string;
			untilId?: string;
			sinceDate?: number;
			untilDate?: number;
			limit?: number;
			offset?: number;
			host?: string;
			userId?: string;
			withFiles?: boolean;
			searchCwAndAlt?: boolean;
			channelId?: string;
			order?: "chronological" | "relevancy";
		};
		res: Note[];
	};
	"notes/show": { req: { noteId: Note["id"] }; res: Note };
	"notes/state": { req: TODO; res: TODO };
	"notes/timeline": {
		req: {
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	"notes/translate": {
		req: {
			noteId: string;
			targetLang: string;
		};
		res: {
			sourceLang: string;
			text: string;
		};
	};
	"notes/unrenote": { req: { noteId: Note["id"] }; res: null };
	"notes/user-list-timeline": {
		req: {
			listId: UserList["id"];
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	"notes/watching/create": { req: TODO; res: TODO };
	"notes/watching/delete": { req: { noteId: Note["id"] }; res: null };

	// notifications
	"notifications/create": {
		req: { body: string; header?: string | null; icon?: string | null };
		res: null;
	};
	"notifications/mark-all-as-read": { req: NoParams; res: null };
	"notifications/read": {
		req: { notificationId: Notification["id"] };
		res: null;
	};

	// page-push
	"page-push": {
		req: { pageId: Page["id"]; event: string; var?: any };
		res: null;
	};

	// pages
	"pages/create": { req: TODO; res: Page };
	"pages/delete": { req: { pageId: Page["id"] }; res: null };
	"pages/featured": { req: NoParams; res: Page[] };
	"pages/like": { req: { pageId: Page["id"] }; res: null };
	"pages/show": {
		req: { pageId?: Page["id"]; name?: string; username?: string };
		res: Page;
	};
	"pages/unlike": { req: { pageId: Page["id"] }; res: null };
	"pages/update": { req: TODO; res: null };

	// ping
	ping: { req: NoParams; res: { pong: number } };

	// pinned-users
	"pinned-users": { req: TODO; res: TODO };

	// promo
	"promo/read": { req: TODO; res: TODO };

	// release
	release: {
		req: null;
		res: {
			version: string;
			notes: string;
			screenshots: string[];
		};
	};

	// request-reset-password
	"request-reset-password": {
		req: { username: string; email: string };
		res: null;
	};

	// reset-password
	"reset-password": { req: { token: string; password: string }; res: null };

	// room
	"room/show": { req: TODO; res: TODO };
	"room/update": { req: TODO; res: TODO };

	// stats
	stats: { req: NoParams; res: Stats };

	// server-info
	"server-info": { req: NoParams; res: ServerInfo };

	// ck specific
	"latest-version": { req: NoParams; res: TODO };

	// signin
	signin: {
		req: {
			username: string;
			password: string;
			"hcaptcha-response"?: null | string;
			"g-recaptcha-response"?: null | string;
		};
		res:
			| {
					id: User["id"];
					i: string;
			  }
			| {
					challenge: string;
					challengeId: string;
					securityKeys: {
						id: string;
					}[];
			  };
	};

	// sw
	"sw/register": { req: TODO; res: TODO };
	"sw/unregister": {
		req: {
			endpoint: string;
		};
		res: null;
	};

	// username
	"username/available": {
		req: { username: string };
		res: { available: boolean };
	};

	// users
	users: {
		req: {
			limit?: number;
			offset?: number;
			sort?: UserSorting;
			origin?: OriginType;
		};
		res: User[];
	};
	"users/clips": { req: TODO; res: TODO };
	"users/followers": {
		req: {
			userId?: User["id"];
			username?: User["username"];
			host?: User["host"] | null;
			limit?: number;
			sinceId?: Following["id"];
			untilId?: Following["id"];
		};
		res: FollowingFollowerPopulated[];
	};
	"users/following": {
		req: {
			userId?: User["id"];
			username?: User["username"];
			host?: User["host"] | null;
			limit?: number;
			sinceId?: Following["id"];
			untilId?: Following["id"];
		};
		res: FollowingFolloweePopulated[];
	};
	"users/gallery/posts": {
		req: {
			userId: User["id"];
			limit?: number;
			sinceId?: NoteFavorite["id"];
			untilId?: NoteFavorite["id"];
		};
		res: GalleryPost[];
	};
	"users/get-frequently-replied-users": { req: TODO; res: TODO };
	"users/groups/create": { req: TODO; res: TODO };
	"users/groups/delete": { req: { groupId: UserGroup["id"] }; res: null };
	"users/groups/invitations/accept": { req: TODO; res: TODO };
	"users/groups/invitations/reject": { req: TODO; res: TODO };
	"users/groups/invite": { req: TODO; res: TODO };
	"users/groups/joined": { req: TODO; res: TODO };
	"users/groups/owned": { req: TODO; res: TODO };
	"users/groups/pull": { req: TODO; res: TODO };
	"users/groups/show": { req: TODO; res: TODO };
	"users/groups/transfer": { req: TODO; res: TODO };
	"users/groups/update": { req: TODO; res: TODO };
	"users/lists/create": { req: { name: string }; res: UserList };
	"users/lists/delete": { req: { listId: UserList["id"] }; res: null };
	"users/lists/list": { req: NoParams; res: UserList[] };
	"users/lists/pull": {
		req: { listId: UserList["id"]; userId: User["id"] };
		res: null;
	};
	"users/lists/push": {
		req: { listId: UserList["id"]; userId: User["id"] };
		res: null;
	};
	"users/lists/show": { req: { listId: UserList["id"] }; res: UserList };
	"users/lists/update": {
		req: { listId: UserList["id"]; name: string };
		res: UserList;
	};
	"users/notes": {
		req: {
			userId: User["id"];
			limit?: number;
			sinceId?: Note["id"];
			untilId?: Note["id"];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	"users/pages": { req: TODO; res: TODO };
	"users/recommendation": { req: TODO; res: TODO };
	"users/relation": { req: TODO; res: TODO };
	"users/report-abuse": { req: TODO; res: TODO };
	"users/search-by-username-and-host": { req: TODO; res: TODO };
	"users/search": {
		req: {
			query: string;
			offset?: number;
			limit?: number;
			origin?: "local" | "remote" | "combined";
			detail?: true; // FIXME: when false, returns UserLite
		};
		res: UserDetailed[];
	};
	"users/show": {
		req: ShowUserReq | { userIds: User["id"][] };
		res: {
			$switch: {
				$cases: [[{ userIds: User["id"][] }, UserDetailed[]]];
				$default: UserDetailed;
			};
		};
	};
	"users/stats": { req: TODO; res: TODO };

	// Mastodon Client API
	"v1/firefish/apps/info": {
		req: {
			client_id: string;
		};
		res: {
			name: string;
		};
	};
	"v1/firefish/auth/code": {
		req: {
			client_id: string;
			redirect_uri: string | null;
			scopes: string | string[];
		};
		res: {
			code: string;
		};
	};
};
