namespace MastodonEntity {
	export type Alerts = {
		follow: boolean;
		favourite: boolean;
		mention: boolean;
		reblog: boolean;
		poll: boolean;
		status: boolean;
	};

	export type PushSubscription = {
		id: string | number;
		endpoint: string;
		server_key: string;
		alerts: Alerts;
	};

	export type NotificationPayload = {
		access_token: string;
		preferred_locale: string;
		notification_id: string;
		notification_type: string;
		icon?: string;
		title?: string;
		body?: string;
	};
}
