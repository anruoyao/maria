import type { MigrationInterface, QueryRunner } from "typeorm";

export class objectStorageS3ForcePathStyle1611547387175
	implements MigrationInterface
{
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "objectStorageS3ForcePathStyle" boolean NOT NULL DEFAULT true`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "objectStorageS3ForcePathStyle"`,
		);
	}
}
