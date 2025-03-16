import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddObjectStorageUseProxy1586624197029
	implements MigrationInterface
{
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "objectStorageUseProxy" boolean NOT NULL DEFAULT true`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "objectStorageUseProxy"`,
			undefined,
		);
	}
}
