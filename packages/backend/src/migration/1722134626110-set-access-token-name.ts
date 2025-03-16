import type { MigrationInterface, QueryRunner } from "typeorm";

export class SetAccessTokenName1722134626110 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "access_token" SET "name" = "app"."name" FROM "app" WHERE "access_token"."name" IS NULL AND "access_token"."appId" = "app"."id"`,
		);
		await queryRunner.query(
			`UPDATE "access_token" SET "description" = "app"."description" FROM "app" WHERE "access_token"."description" IS NULL AND "access_token"."appId" = "app"."id"`,
		);
	}

	public async down(_: QueryRunner): Promise<void> {
		/* You don't need to revert this migration. */
	}
}
