import type { MigrationInterface, QueryRunner } from "typeorm";

export class MoreUrls1699305365258 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		queryRunner.query(
			`ALTER TABLE "meta" ADD "moreUrls" jsonb NOT NULL DEFAULT '[]'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "moreUrls"`);
	}
}
