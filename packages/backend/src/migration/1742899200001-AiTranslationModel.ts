import type { MigrationInterface, QueryRunner } from "typeorm";

export class AiTranslationModel1742899200001 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
				ALTER TABLE "meta"
				ADD "aiTranslateModel" character varying(128)
		`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
				ALTER TABLE "meta" DROP COLUMN "aiTranslateModel"
		`);
	}
}
