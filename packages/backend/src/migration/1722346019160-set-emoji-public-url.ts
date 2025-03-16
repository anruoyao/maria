import type { MigrationInterface, QueryRunner } from "typeorm";

export class SetEmojiPublicUrl1722346019160 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "emoji" SET "publicUrl" = "originalUrl" WHERE "publicUrl" = ''`,
		);
		await queryRunner.query(
			`ALTER TABLE "emoji" ALTER COLUMN "publicUrl" DROP DEFAULT`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "emoji" ALTER COLUMN "publicUrl" SET DEFAULT ''`,
		);
	}
}
