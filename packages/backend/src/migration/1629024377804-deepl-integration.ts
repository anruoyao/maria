import type { MigrationInterface, QueryRunner } from "typeorm";

export class deeplIntegration1629024377804 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "deeplAuthKey" character varying(128)`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "deeplAuthKey"`);
	}
}
