import type { MigrationInterface, QueryRunner } from "typeorm";

export class v1221579270193251 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "announcement_read" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "announcement_read" DROP COLUMN "createdAt"`,
			undefined,
		);
	}
}
