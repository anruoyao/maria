import type { MigrationInterface, QueryRunner } from "typeorm";

export class SwSubscriptionAccessToken1709395223612
	implements MigrationInterface
{
	name = "SwSubscriptionAccessToken1709395223612";

	async up(queryRunner: QueryRunner) {
		await queryRunner.query(
			`ALTER TABLE "sw_subscription" ADD COLUMN IF NOT EXISTS "appAccessTokenId" character varying(32)`,
		);
		await queryRunner.query(
			`ALTER TABLE "sw_subscription" ADD CONSTRAINT "FK_98a1aa2db2a5253924f42f38767" FOREIGN KEY ("appAccessTokenId") REFERENCES "access_token"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_98a1aa2db2a5253924f42f3876" ON "sw_subscription" ("appAccessTokenId") `,
		);
	}

	async down(queryRunner: QueryRunner) {
		await queryRunner.query(
			`ALTER TABLE "sw_subscription" DROP CONSTRAINT "FK_98a1aa2db2a5253924f42f38767"`,
		);
		await queryRunner.query(
			`ALTER TABLE "sw_subscription" DROP COLUMN "appAccessTokenId"`,
		);
	}
}
