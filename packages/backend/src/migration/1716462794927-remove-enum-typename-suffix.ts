import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveEnumTypenameSuffix1716462794927
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TYPE "antenna_src_enum" RENAME TO "antenna_src"`,
		);
		await queryRunner.query(
			`ALTER TYPE "drive_file_usage_hint_enum" RENAME TO "drive_file_usage_hint"`,
		);
		await queryRunner.query(
			`ALTER TYPE "muted_note_reason_enum" RENAME TO "muted_note_reason"`,
		);
		await queryRunner.query(
			`ALTER TYPE "note_visibility_enum" RENAME TO "note_visibility"`,
		);
		await queryRunner.query(
			`ALTER TYPE "notification_type_enum" RENAME TO "notification_type"`,
		);
		await queryRunner.query(
			`ALTER TYPE "page_visibility_enum" RENAME TO "page_visibility"`,
		);
		await queryRunner.query(
			`ALTER TYPE "poll_notevisibility_enum" RENAME TO "poll_note_visibility"`,
		);
		await queryRunner.query(
			`ALTER TYPE "relay_status_enum" RENAME TO "relay_status"`,
		);
		await queryRunner.query(
			`ALTER TYPE "user_emojimodperm_enum" RENAME TO "user_emoji_mod_perm"`,
		);
		await queryRunner.query(
			`ALTER TYPE "user_profile_ffvisibility_enum" RENAME TO "user_profile_ffvisibility"`,
		);
		await queryRunner.query(
			`ALTER TYPE "user_profile_mutingnotificationtypes_enum" RENAME TO "user_profile_muting_notification_types"`,
		);
	}
	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TYPE "antenna_src" RENAME TO "antenna_src_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "drive_file_usage_hint" RENAME TO "drive_file_usage_hint_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "muted_note_reason" RENAME TO "muted_note_reason_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "note_visibility" RENAME TO "note_visibility_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "notification_type" RENAME TO "notification_type_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "page_visibility" RENAME TO "page_visibility_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "poll_note_visibility" RENAME TO "poll_notevisibility_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "relay_status" RENAME TO "relay_status_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "user_emoji_mod_perm" RENAME TO "user_emojimodperm_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "user_profile_ffvisibility" RENAME TO "user_profile_ffvisibility_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "user_profile_muting_notification_types" RENAME TO "user_profile_mutingnotificationtypes_enum"`,
		);
	}
}
