import type { MigrationInterface, QueryRunner } from "typeorm";

export class DropUnusedUserprofileColumns1714259023878
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "clientData"`,
		);
		await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "room"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "room" jsonb NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "user_profile"."room" IS 'The room data of the User.'`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "clientData" jsonb NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "user_profile"."clientData" IS 'The client-specific data of the User.'`,
		);
	}
}
