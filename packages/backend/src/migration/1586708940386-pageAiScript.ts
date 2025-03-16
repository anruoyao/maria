import type { MigrationInterface, QueryRunner } from "typeorm";

export class pageAiScript1586708940386 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "page" ADD "script" character varying(16384) NOT NULL DEFAULT ''`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "page" DROP COLUMN "script"`,
			undefined,
		);
	}
}
