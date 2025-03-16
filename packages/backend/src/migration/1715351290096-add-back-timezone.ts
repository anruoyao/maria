import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddBackTimezone1715351290096 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "abuse_user_report" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "access_token" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "access_token" ALTER "lastUsedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "ad" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "ad" ALTER "expiresAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "announcement" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "announcement" ALTER "updatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "announcement_read" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "app" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "attestation_challenge" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "auth_session" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "blocking" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel" ALTER "lastNotedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel_following" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel_note_pining" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "clip" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "drive_file" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "drive_folder" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "emoji" ALTER "updatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "following" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "follow_request" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "gallery_like" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "gallery_post" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "gallery_post" ALTER "updatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "instance" ALTER "caughtAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "instance" ALTER "infoUpdatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "instance" ALTER "lastCommunicatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "instance" ALTER "latestRequestReceivedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "instance" ALTER "latestRequestSentAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "messaging_message" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "moderation_log" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "muting" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "muting" ALTER "expiresAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "note" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "note" ALTER "updatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "note_edit" ALTER "updatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "note_favorite" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "note_reaction" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "note_thread_muting" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "note_watching" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "notification" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "page" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "page" ALTER "updatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "page_like" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "password_reset_request" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "poll" ALTER "expiresAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "poll_vote" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "promo_note" ALTER "expiresAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "promo_read" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "registration_ticket" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "registry_item" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "registry_item" ALTER "updatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "renote_muting" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "reply_muting" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "signin" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "sw_subscription" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "used_username" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user" ALTER "lastActiveDate" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user" ALTER "lastFetchedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user" ALTER "updatedAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_group" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_group_invitation" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_group_invite" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_group_joining" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_ip" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_list" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_list_joining" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_note_pining" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_pending" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_security_key" ALTER "lastUsed" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "webhook" ALTER "createdAt" TYPE timestamp with time zone`,
		);
		await queryRunner.query(
			`ALTER TABLE "webhook" ALTER "latestSentAt" TYPE timestamp with time zone`,
		);
	}

	public async down(_: QueryRunner): Promise<void> {
		// await queryRunner.query(
		// 	`ALTER TABLE "abuse_user_report" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "access_token" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "access_token" ALTER "lastUsedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "ad" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "ad" ALTER "expiresAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "announcement" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "announcement" ALTER "updatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "announcement_read" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "antenna" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "app" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "attestation_challenge" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "auth_session" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "blocking" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "channel" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "channel" ALTER "lastNotedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "channel_following" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "channel_note_pining" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "clip" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "drive_file" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "drive_folder" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "emoji" ALTER "updatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "following" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "follow_request" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "gallery_like" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "gallery_post" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "gallery_post" ALTER "updatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "instance" ALTER "caughtAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "instance" ALTER "infoUpdatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "instance" ALTER "lastCommunicatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "instance" ALTER "latestRequestReceivedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "instance" ALTER "latestRequestSentAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "messaging_message" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "moderation_log" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "muting" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "muting" ALTER "expiresAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "note" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "note" ALTER "updatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "note_edit" ALTER "updatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "note_favorite" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "note_reaction" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "note_thread_muting" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "note_watching" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "notification" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "page" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "page" ALTER "updatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "page_like" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "password_reset_request" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "poll" ALTER "expiresAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "poll_vote" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "promo_note" ALTER "expiresAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "promo_read" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "registration_ticket" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "registry_item" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "registry_item" ALTER "updatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "renote_muting" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "reply_muting" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "signin" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "sw_subscription" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "used_username" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user" ALTER "lastActiveDate" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user" ALTER "lastFetchedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user" ALTER "updatedAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_group" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_group_invitation" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_group_invite" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_group_joining" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_ip" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_list" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_list_joining" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_note_pining" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_pending" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "user_security_key" ALTER "lastUsed" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "webhook" ALTER "createdAt" TYPE timestamp without time zone`,
		// );
		// await queryRunner.query(
		// 	`ALTER TABLE "webhook" ALTER "latestSentAt" TYPE timestamp without time zone`,
		// );
	}
}
