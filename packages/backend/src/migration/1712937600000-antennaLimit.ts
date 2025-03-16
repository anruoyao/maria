import type { MigrationInterface, QueryRunner } from "typeorm";

export class antennaLimit1712937600000 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "antennaLimit" integer NOT NULL DEFAULT 5`,
			undefined,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "meta"."antennaLimit" IS 'Antenna Limit'`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "antennaLimit"`,
			undefined,
		);
	}
}
