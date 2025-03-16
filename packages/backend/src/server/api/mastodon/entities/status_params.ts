namespace MastodonEntity {
	export type StatusParams = {
		text: string;
		in_reply_to_id: string | null;
		media_ids: Array<string> | null;
		sensitive: boolean | null;
		spoiler_text: string | null;
		visibility: "public" | "unlisted" | "private" | "direct";
		application_id: number;
		language: string | null;
		idempotency: string | null;
		with_rate_limit: boolean;
		poll: {
			options: string[];
			expires_in: string;
			multiple: boolean | null;
			hide_totals: boolean | null;
		} | null;
	};
}
