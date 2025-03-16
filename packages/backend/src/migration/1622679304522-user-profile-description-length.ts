import type { MigrationInterface, QueryRunner } from "typeorm";

export class userProfileDescriptionLength1622679304522
	implements MigrationInterface
{
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "description" TYPE character varying(2048)`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "description" TYPE character varying(1024)`,
			undefined,
		);
	}
}
