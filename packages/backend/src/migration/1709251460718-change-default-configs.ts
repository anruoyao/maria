import type { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDefaultConfigs1709251460718 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "disableRegistration" SET DEFAULT true`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "publicReactions" SET DEFAULT true`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "noCrawle" SET DEFAULT true`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "noCrawle" SET DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "publicReactions" SET DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "disableRegistration" SET DEFAULT false`,
		);
	}
}
