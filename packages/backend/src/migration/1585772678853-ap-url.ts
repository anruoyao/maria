import type { MigrationInterface, QueryRunner } from "typeorm";

export class apUrl1585772678853 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "note" ADD "url" character varying(512)`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "url"`, undefined);
	}
}
