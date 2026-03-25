import type { MigrationInterface, QueryRunner } from "typeorm";

export class AiTranslation1742899200000 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
				ALTER TABLE "meta"
				ADD "aiTranslateApiUrl" character varying(512)
		`);
		await queryRunner.query(`
				ALTER TABLE "meta"
				ADD "aiTranslateApiKey" character varying(512)
		`);
		await queryRunner.query(`
				ALTER TABLE "meta"
				ADD "aiTranslatePrompt" character varying(4096)
		`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
				ALTER TABLE "meta" DROP COLUMN "aiTranslatePrompt"
		`);
		await queryRunner.query(`
				ALTER TABLE "meta" DROP COLUMN "aiTranslateApiKey"
		`);
		await queryRunner.query(`
				ALTER TABLE "meta" DROP COLUMN "aiTranslateApiUrl"
		`);
	}
}
