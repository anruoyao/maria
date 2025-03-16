import type * as consts from "./consts.js";
import type { Packed } from "./misc/schema.js";

export type ID = string;
export type DateString = string;

type TODO = Record<string, any>;

// NOTE: 極力この型を使うのは避け、UserLite か UserDetailed か明示するように
export type User = UserLite & Partial<UserDetailed>;

export type UserLite = {
	id: ID;
	username: string;
	host: string | null;
	name: string;
	onlineStatus: "online" | "active" | "offline" | "unknown";
	avatarUrl: string;
	avatarBlurhash: string;
	alsoKnownAs: string[];
	movedToUri: any;
	emojis: EmojiLite[];
	instance?: InstanceLite;
	avatarColor: null;
	emojiModPerm: "unauthorized" | "add" | "mod" | "full";
	isAdmin?: boolean;
	isModerator?: boolean;
	isBot?: boolean;
	isLocked: boolean;
	isIndexable: boolean;
	isCat?: boolean;
	speakAsCat?: boolean;
	readCatLanguage?: boolean;
	driveCapacityOverrideMb: number | null;
};

export type UserDetailed = UserLite & {
	bannerBlurhash: string | null;
	bannerColor: string | null;
	bannerUrl: string | null;
	birthday: string | null;
	createdAt: DateString;
	description: string | null;
	ffVisibility: "public" | "followers" | "private";
	fields: {
		name: string;
		value: string;
		verified?: boolean;
	}[];
	followersCount: number;
	followingCount: number;
	hasPendingFollowRequestFromYou: boolean;
	hasPendingFollowRequestToYou: boolean;
	isAdmin: boolean;
	isBlocked: boolean;
	isBlocking: boolean;
	isBot: boolean;
	isCat: boolean;
	isFollowed: boolean;
	isFollowing: boolean;
	isModerator: boolean;
	isMuted: boolean;
	isRenoteMuted: boolean;
	isReplyMuted: boolean;
	isSilenced: boolean;
	isSuspended: boolean;
	lang: string | null;
	lastFetchedAt?: DateString;
	location: string | null;
	notesCount: number;
	pinnedNoteIds: ID[];
	pinnedNotes: Note[];
	pinnedPage: Page | null;
	pinnedPageId: string | null;
	publicReactions: boolean;
	securityKeys: boolean;
	twoFactorEnabled: boolean;
	updatedAt: DateString | null;
	uri: string | null;
	url: string | null;
};

export type UserGroup = {
	id: ID;
} & Record<string, TODO>;

export type UserList = {
	id: ID;
	createdAt: DateString;
	name: string;
	userIds: User["id"][];
};

export type MeDetailed = UserDetailed & {
	avatarId: DriveFile["id"];
	bannerId: DriveFile["id"];
	autoAcceptFollowed: boolean;
	alwaysMarkNsfw: boolean;
	carefulBot: boolean;
	emailNotificationTypes: string[];
	hasPendingReceivedFollowRequest: boolean;
	hasUnreadAnnouncement: boolean;
	hasUnreadAntenna: boolean;
	hasUnreadChannel: boolean;
	hasUnreadMentions: boolean;
	hasUnreadMessagingMessage: boolean;
	hasUnreadNotification: boolean;
	hasUnreadSpecifiedNotes: boolean;
	hideOnlineStatus: boolean;
	injectFeaturedNote: boolean;
	integrations: Record<string, any>;
	isDeleted: boolean;
	isExplorable: boolean;
	mutedWords: string[][];
	mutedPatterns: string[];
	mutingNotificationTypes: (typeof consts.notificationTypes)[number][];
	noCrawle: boolean;
	preventAiLearning: boolean;
	receiveAnnouncementEmail: boolean;
	usePasswordLessLogin: boolean;
	token: string;
	[other: string]: any;
};

export type DriveFile = {
	id: ID;
	createdAt: DateString;
	isSensitive: boolean;
	name: string;
	thumbnailUrl: string;
	url: string;
	type: string;
	size: number;
	md5: string;
	blurhash: string;
	comment: string | null;
	properties: Record<string, any>;
	userId?: User["id"];
	user?: User;
};

export type DriveFolder = TODO;

export type GalleryPost = {
	id: ID;
	createdAt: DateString;
	updatedAt: DateString;
	title: string;
	description: string | null;
	userId: User["id"];
	user: UserDetailed;
	fileIds?: DriveFile["id"][];
	files?: DriveFile[];
	tags?: string[];
	isSensitive: boolean;
	isLiked?: boolean;
	likedCount: number;
};

export type Note = {
	id: ID;
	createdAt: DateString;
	text: string | null;
	cw: string | null;
	user: User;
	userId: User["id"];
	reply?: Note;
	replyId: Note["id"] | null;
	renote?: Note;
	renoteId: Note["id"] | null;
	files: DriveFile[];
	fileIds: DriveFile["id"][];
	visibility: "public" | "home" | "followers" | "specified";
	visibleUserIds?: User["id"][];
	lang?: string;
	localOnly?: boolean;
	channelId?: Channel["id"];
	channel?: Channel;
	myReaction?: string;
	myRenoteCount?: number;
	reactions: Record<string, number>;
	renoteCount: number;
	repliesCount: number;
	quoteCount: number;
	poll?: {
		expiresAt: DateString | null;
		multiple: boolean;
		choices: {
			isVoted: boolean;
			text: string;
			votes: number;
		}[];
	};
	emojis: EmojiLite[];
	uri?: string;
	url?: string;
	updatedAt?: DateString;
	isHidden?: boolean;
	scheduledAt?: DateString;
	/** if the note is a history */
	historyId?: ID;
};

export type NoteEdit = {
	id: string;
	noteId: string;
	text: string | null;
	cw: string | null;
	updatedAt: string;
	fileIds: DriveFile["id"][];
	files: DriveFile[];
	emojis: EmojiLite[];
};

export type NoteReaction = {
	id: ID;
	createdAt: DateString;
	user: UserLite;
	type: string;
};

interface BaseNotification {
	id: ID;
	createdAt: DateString;
	isRead: boolean;
	type: (typeof consts.notificationTypes)[number];
}

export interface ReactionNotification extends BaseNotification {
	type: "reaction";
	reaction: string;
	user: User;
	userId: User["id"];
	note: Note;
}
export interface ReplyNotification extends BaseNotification {
	type: "reply";
	user: User;
	userId: User["id"];
	note: Note;
}
export interface RenoteNotification extends BaseNotification {
	type: "renote";
	user: User;
	userId: User["id"];
	note: Note & {
		renote: Note;
		renoteId: string;
	};
}
export interface QuoteNotification extends BaseNotification {
	type: "quote";
	user: User;
	userId: User["id"];
	note: Note;
}
export interface MentionNotification extends BaseNotification {
	type: "mention";
	user: User;
	userId: User["id"];
	note: Note;
}
export interface PollVoteNotification extends BaseNotification {
	type: "pollVote";
	user: User;
	userId: User["id"];
	note: Note;
}
export interface PollEndedNotification extends BaseNotification {
	type: "pollEnded";
	user: User;
	userId: User["id"];
	note: Note;
}
export interface FollowNotification extends BaseNotification {
	type: "follow";
	user: User;
	userId: User["id"];
}

export interface FollowRequestAcceptedNotification extends BaseNotification {
	type: "followRequestAccepted";
	user: User;
	userId: User["id"];
}
export interface ReceiveFollowRequestNotification extends BaseNotification {
	type: "receiveFollowRequest";
	user: User;
	userId: User["id"];
}
export interface GroupInvitedNotification extends BaseNotification {
	type: "groupInvited";
	invitation: UserGroup;
	user: User;
	userId: User["id"];
}
export interface AppNotification extends BaseNotification {
	type: "app";
	header?: string | null;
	body: string;
	icon?: string | null;
}

export type Notification =
	| ReactionNotification
	| ReplyNotification
	| RenoteNotification
	| QuoteNotification
	| MentionNotification
	| PollVoteNotification
	| PollEndedNotification
	| FollowNotification
	| FollowRequestAcceptedNotification
	| ReceiveFollowRequestNotification
	| GroupInvitedNotification
	| AppNotification;

export type MessagingMessage = {
	id: ID;
	createdAt: DateString;
	file: DriveFile | null;
	fileId: DriveFile["id"] | null;
	isRead: boolean;
	reads: User["id"][];
	text: string | null;
	user: User;
	userId: User["id"];
	recipient?: User | null;
	recipientId: User["id"] | null;
	group?: UserGroup | null;
	groupId: UserGroup["id"] | null;
};

export type CustomEmoji = {
	id: string;
	name: string;
	url: string;
	category: string;
	aliases: string[];
};

export type EmojiLite = {
	id: string;
	name: string;
	url: string;
	width: number | null;
	height: number | null;
};

export type LiteInstanceMetadata = {
	maintainerName: string | null;
	maintainerEmail: string | null;
	version: string;
	name: string | null;
	uri: string;
	description: string | null;
	donationLink?: string;
	tosUrl: string | null;
	disableRegistration: boolean;
	disableLocalTimeline: boolean;
	disableRecommendedTimeline: boolean;
	disableGlobalTimeline: boolean;
	driveCapacityPerLocalUserMb: number;
	driveCapacityPerRemoteUserMb: number;
	antennaLimit: number;
	enableHcaptcha: boolean;
	hcaptchaSiteKey: string | null;
	enableRecaptcha: boolean;
	recaptchaSiteKey: string | null;
	swPublickey: string | null;
	maxNoteTextLength: number;
	enableEmail: boolean;
	enableServiceWorker: boolean;
	markLocalFilesNsfwByDefault: boolean;
	emojis: CustomEmoji[];
	ads: {
		id: ID;
		ratio: number;
		place: string;
		url: string;
		imageUrl: string;
	}[];
};

export type DetailedInstanceMetadata = LiteInstanceMetadata & {
	features: {
		registration: boolean;
		localTimeLine: boolean;
		recommendedTimeLine: boolean;
		globalTimeLine: boolean;
		searchFilters: boolean;
		hcaptcha: boolean;
		recaptcha: boolean;
		objectStorage: boolean;
		serviceWorker: boolean;
		miauth?: boolean;
	};
	langs: string[];
	moreUrls: { name: string; url: string }[];
	repositoryUrl: string;
	feedbackUrl: string;
	defaultDarkTheme: string | null;
	defaultLightTheme: string | null;
	enableGuestTimeline: boolean;
	cacheRemoteFiles: boolean;
	emailRequiredForSignup: boolean;
	mascotImageUrl: string;
	bannerUrl: string;
	backgroundImageUrl: string;
	errorImageUrl: string;
	iconUrl: string | null;
	maxCaptionTextLength: number;
	requireSetup: boolean;
	translatorAvailable: boolean;
	proxyAccountName: string | null;
	secureMode?: boolean;
	privateMode?: boolean;
	defaultReaction: string;
	donationLink?: string | null;
	enableServerMachineStats?: boolean;
};

export type InstanceMetadata = LiteInstanceMetadata | DetailedInstanceMetadata;

export type ServerInfo = {
	machine: string;
	cpu: {
		model: string;
		cores: number;
	};
	mem: {
		total: number;
	};
	fs: {
		total: number;
		used: number;
	};
};

export type Stats = {
	notesCount: number;
	originalNotesCount: number;
	usersCount: number;
	originalUsersCount: number;
	instances: number;
	driveUsageLocal: number;
	driveUsageRemote: number;
};

export type Page = {
	id: ID;
	createdAt: DateString;
	updatedAt: DateString;
	userId: User["id"];
	user: User;
	content: Record<string, any>[];
	variables: Record<string, any>[];
	title: string;
	name: string;
	summary: string | null;
	hideTitleWhenPinned: boolean;
	alignCenter: boolean;
	font: string;
	script: string;
	eyeCatchingImageId: DriveFile["id"] | null;
	eyeCatchingImage: DriveFile | null;
	attachedFiles: any;
	likedCount: number;
	isLiked?: boolean;
};

export type PageEvent = {
	pageId: Page["id"];
	event: string;
	var: any;
	userId: User["id"];
	user: User;
};

export type Announcement = {
	id: ID;
	createdAt: DateString;
	updatedAt: DateString | null;
	text: string;
	title: string;
	imageUrl: string | null;
	isRead?: boolean;
	isGoodNews: boolean;
	showPopup: boolean;
};

export type Antenna = {
	id: ID;
	createdAt: DateString;
	name: string;
	keywords: string[][]; // TODO
	excludeKeywords: string[][]; // TODO
	src: "home" | "all" | "users" | "list" | "group" | "instances";
	userListId: ID | null; // TODO
	userGroupId: ID | null; // TODO
	users: string[]; // TODO
	instances: string[];
	caseSensitive: boolean;
	notify: boolean;
	withReplies: boolean;
	withFile: boolean;
	hasUnreadNote: boolean;
};

export type App = TODO;

export type AuthSession = {
	id: ID;
	app: App;
	token: string;
};

export type Ad = TODO;

export type Clip = Packed<"Clip">;

export type NoteFavorite = {
	id: ID;
	createdAt: DateString;
	noteId: Note["id"];
	note: Note;
};

export type FollowRequest = {
	id: ID;
	follower: User;
	followee: User;
};

export type Channel = {
	id: ID;
	createdAt: DateString;
	lastNotedAt: DateString | null;
	name: string;
	description: string | null;
	bannerId: DriveFile["id"];
	bannerUrl: string | null;
	notesCount: number;
	usersCount: number;
	isFollowing?: boolean;
	userId: User["id"] | null;
	hasUnreadNote?: boolean;
};

export type Following = {
	id: ID;
	createdAt: DateString;
	followerId: User["id"];
	followeeId: User["id"];
};

export type FollowingFolloweePopulated = Following & {
	followee: UserDetailed;
};

export type FollowingFollowerPopulated = Following & {
	follower: UserDetailed;
};

export type Blocking = {
	id: ID;
	createdAt: DateString;
	blockeeId: User["id"];
	blockee: UserDetailed;
};

export type InstanceLite = {
	name: Instance["name"];
	softwareName: Instance["softwareName"];
	softwareVersion: Instance["softwareVersion"];
	iconUrl: Instance["iconUrl"];
	faviconUrl: Instance["faviconUrl"];
	themeColor: Instance["themeColor"];
};

export type Instance = {
	id: ID;
	caughtAt: DateString;
	host: string;
	usersCount: number;
	notesCount: number;
	followingCount: number;
	followersCount: number;
	driveUsage: number;
	driveFiles: number;
	latestRequestSentAt: DateString | null;
	latestStatus: number | null;
	latestRequestReceivedAt: DateString | null;
	lastCommunicatedAt: DateString;
	isNotResponding: boolean;
	isSuspended: boolean;
	isBlocked: boolean;
	isSilenced: boolean;
	softwareName: string | null;
	softwareVersion: string | null;
	openRegistrations: boolean | null;
	name: string | null;
	description: string | null;
	maintainerName: string | null;
	maintainerEmail: string | null;
	iconUrl: string | null;
	faviconUrl: string | null;
	themeColor: string | null;
	infoUpdatedAt: DateString | null;
};

export type Signin = {
	id: ID;
	createdAt: DateString;
	ip: string;
	headers: Record<string, any>;
	success: boolean;
};

export type UserSorting =
	| "+follower"
	| "-follower"
	| "+createdAt"
	| "-createdAt"
	| "+updatedAt"
	| "-updatedAt";
export type OriginType = "combined" | "local" | "remote";

export type AbuseUserReport = {
	id: string;
	createdAt: DateString;
	comment: string;
	resolved: boolean;
	reporterId: User["id"];
	targetUserId: User["id"];
	assigneeId: User["id"] | null;
	reporter: UserDetailed;
	targetUser: UserDetailed;
	assignee?: UserDetailed | null;
	forwarded: boolean;
};
