import type { MigrationInterface, QueryRunner } from "typeorm";

export class TurnOffCatLanguage1720107645050 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" ADD COLUMN "readCatLanguage" boolean NOT NULL DEFAULT true`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "user"."readCatLanguage" IS 'Whether to enable the cat language conversion.'`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "readCatLanguage"`);
	}
}
