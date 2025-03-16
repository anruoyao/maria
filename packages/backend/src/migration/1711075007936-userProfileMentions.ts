import type { MigrationInterface, QueryRunner } from "typeorm";

export class UserProfileMentions1711075007936 implements MigrationInterface {
	name = "UserProfileMentions1711075007936";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "mentions" jsonb NOT NULL DEFAULT '[]'`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "mentions"`,
		);
	}
}
