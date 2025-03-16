import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostLang1695334243217 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "note" ADD "lang" character varying(10)`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "lang"`);
	}
}
