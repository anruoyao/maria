import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddMastodonSubscriptionType1715181461692
	implements MigrationInterface
{
	name = "AddMastodonSubscriptionType1715181461692";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "push_subscription_type" AS ENUM ('mention', 'status', 'reblog', 'follow', 'follow_request', 'favourite', 'poll', 'update', 'admin.sign_up', 'admin.report')`,
		);
		await queryRunner.query(
			`ALTER TABLE "sw_subscription" ADD "subscriptionTypes" push_subscription_type array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(`
			UPDATE "sw_subscription"
			SET "subscriptionTypes" = ARRAY['mention', 'status', 'reblog', 'follow', 'follow_request', 'favourite', 'poll', 'update']::push_subscription_type[]
			WHERE "appAccessTokenId" IS NOT NULL	
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "sw_subscription" DROP COLUMN "subscriptionTypes"`,
		);
		await queryRunner.query(`DROP TYPE "push_subscription_type"`);
	}
}
