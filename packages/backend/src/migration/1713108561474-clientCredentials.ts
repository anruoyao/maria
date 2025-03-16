import type { MigrationInterface, QueryRunner } from "typeorm";

export class ClientCredentials1713108561474 implements MigrationInterface {
	name = "ClientCredentials1713108561474";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "access_token" ALTER COLUMN "userId" DROP NOT NULL`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`DELETE FROM "access_token" WHERE "userId" IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "access_token" ALTER COLUMN "userId" SET NOT NULL`,
		);
	}
}
