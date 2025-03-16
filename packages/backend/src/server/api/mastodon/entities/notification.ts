/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace MastodonEntity {
	export type Notification = {
		account: Account;
		created_at: string;
		id: string;
		status?: Status;
		reaction?: Reaction;
		type: NotificationType;
	};

	export type NotificationType =
		| "mention"
		| "status"
		| "reblog"
		| "follow"
		| "follow_request"
		| "favourite"
		| "poll"
		| "update"
		| "admin.sign_up"
		| "admin.report";
}
