import type { MigrationInterface, QueryRunner } from "typeorm";

export class clipDescription1605408848373 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "clip" ADD "description" character varying(2048) DEFAULT null`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "clip" DROP COLUMN "description"`);
	}
}
