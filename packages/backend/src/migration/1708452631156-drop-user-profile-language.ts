import type { MigrationInterface, QueryRunner } from "typeorm";

export class DropUserProfileLanguage1708452631156
	implements MigrationInterface
{
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "lang"`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN "lang" character varying(32)`,
		);
	}
}
