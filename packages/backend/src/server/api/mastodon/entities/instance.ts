/// <reference path="account.ts" />
/// <reference path="urls.ts" />
/// <reference path="stats.ts" />

namespace MastodonEntity {
	export type Instance = {
		uri: string;
		title: string;
		description: string;
		email: string;
		version: string;
		thumbnail: string | null;
		urls: URLs;
		stats: Stats;
		languages: Array<string>;
		contact_account: Account | null;
		max_toot_chars?: number;
		registrations?: boolean;
		configuration?: {
			statuses: {
				max_characters: number;
				max_media_attachments: number;
				characters_reserved_per_url: number;
			};
			media_attachments: {
				supported_mime_types: Array<string>;
				image_size_limit: number;
				image_matrix_limit: number;
				video_size_limit: number;
				video_frame_rate_limit: number;
				video_matrix_limit: number;
			};
			polls: {
				max_options: number;
				max_characters_per_option: number;
				min_expiration: number;
				max_expiration: number;
			};
		};
	};

	export type InstanceV2 = {
		domain: string;
		title: string;
		version: string;
		source_url: string;
		description: string;
		usage: {
			users: {
				active_month: number;
			};
		};
		thumbnail: {
			url: string;
			blurhash?: string;
			versions?: {
				"@1x"?: string;
				"@2x"?: string;
			};
		};
		languages: string[];
		configuration: {
			urls: {
				streaming: string;
			};
			vapid: {
				public_key: string;
			};
			accounts: {
				max_featured_tags: number;
			};
			statuses: {
				max_characters: number;
				max_media_attachments: number;
				characters_reserved_per_url: number;
			};
			media_attachments: {
				supported_mime_types: string[];
				image_size_limit: number;
				image_matrix_limit: number;
				video_size_limit: number;
				video_frame_rate_limit: number;
				video_matrix_limit: number;
			};
			polls: {
				max_options: number;
				max_characters_per_option: number;
				min_expiration: number;
				max_expiration: number;
			};
			translation: {
				enabled: boolean;
			};
		};
		registrations: {
			enabled: boolean;
			approval_required: boolean;
			message: string | null;
		};
		contact: {
			email: string;
			account: Account | null;
		};
		rules: {
			id: string;
			text: string;
		}[];
	};
}
