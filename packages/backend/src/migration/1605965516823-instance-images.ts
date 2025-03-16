import type { MigrationInterface, QueryRunner } from "typeorm";

export class instanceImages1605965516823 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "backgroundImageUrl" character varying(512)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "logoImageUrl" character varying(512)`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "logoImageUrl"`);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "backgroundImageUrl"`,
		);
	}
}
