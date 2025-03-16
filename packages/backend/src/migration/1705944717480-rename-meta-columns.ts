import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameMetaColumns1705944717480 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" RENAME COLUMN "customMOTD" TO "customMotd"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" RENAME COLUMN "objectStorageUseSSL" TO "objectStorageUseSsl"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" RENAME COLUMN "ToSUrl" TO "tosUrl"`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" RENAME COLUMN "tosUrl" TO "ToSUrl"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" RENAME COLUMN "objectStorageUseSsl" TO "objectStorageUseSSL"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" RENAME COLUMN "customMotd" TO "customMOTD"`,
		);
	}
}
