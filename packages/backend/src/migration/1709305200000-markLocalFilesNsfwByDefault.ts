import type { MigrationInterface, QueryRunner } from "typeorm";

export class markLocalFilesNsfwByDefault1709305200000
	implements MigrationInterface
{
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "markLocalFilesNsfwByDefault" boolean NOT NULL DEFAULT false`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "markLocalFilesNsfwByDefault"`,
			undefined,
		);
	}
}
