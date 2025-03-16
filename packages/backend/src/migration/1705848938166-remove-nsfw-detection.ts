import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveNsfwDetection1705848938166 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "drive_file" DROP COLUMN "maybeSensitive"`,
		);
		await queryRunner.query(`ALTER TABLE "drive_file" DROP COLUMN "maybePorn"`);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "sensitiveMediaDetection"`,
		);
		await queryRunner.query(
			`DROP TYPE "public"."meta_sensitivemediadetection_enum"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "sensitiveMediaDetectionSensitivity"`,
		);
		await queryRunner.query(
			`DROP TYPE "public"."meta_sensitivemediadetectionsensitivity_enum"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "setSensitiveFlagAutomatically"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "enableSensitiveMediaDetectionForVideos"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "autoSensitive"`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "autoSensitive" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableSensitiveMediaDetectionForVideos" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "setSensitiveFlagAutomatically" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."meta_sensitivemediadetectionsensitivity_enum" AS ENUM('medium', 'low', 'high', 'veryLow', 'veryHigh')`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "sensitiveMediaDetectionSensitivity" "public"."meta_sensitivemediadetectionsensitivity_enum" NOT NULL DEFAULT 'medium'`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."meta_sensitivemediadetection_enum" AS ENUM('none', 'all', 'local', 'remote')`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "sensitiveMediaDetection" "public"."meta_sensitivemediadetection_enum" NOT NULL DEFAULT 'none'`,
		);
		await queryRunner.query(
			`ALTER TABLE "drive_file" ADD "maybePorn" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "drive_file" ADD "maybeSensitive" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "drive_file"."maybeSensitive" IS 'Whether the DriveFile is NSFW. (predict)'`,
		);
	}
}
