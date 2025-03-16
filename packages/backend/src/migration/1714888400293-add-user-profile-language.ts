import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileLanguage1714888400293 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN "lang" character varying(32)`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "lang"`);
	}
}
