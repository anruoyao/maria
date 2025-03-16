import type { MigrationInterface, QueryRunner } from "typeorm";

export class UserprofileJsonbToArray1714270605574
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" RENAME COLUMN "mutedInstances" TO "mutedInstances_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN "mutedInstances" character varying(512)[] NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`UPDATE "user_profile" SET "mutedInstances" = ARRAY(SELECT jsonb_array_elements_text("mutedInstances_old"))::character varying(512)[]`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "mutedInstances_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" RENAME COLUMN "mutedWords" TO "mutedWords_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN "mutedWords" text[] NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE TEMP TABLE "MmVqAUUgpshTCQcw" ("userId" character varying(32), "kws" text[])`,
		);
		await queryRunner.query(
			`INSERT INTO "MmVqAUUgpshTCQcw" ("userId", "kws")	SELECT "userId", array_agg("X"."w") FROM (SELECT "userId", array_to_string(ARRAY(SELECT jsonb_array_elements_text("kw")), ' ') AS "w" FROM (SELECT "userId", jsonb_array_elements("mutedWords_old") AS "kw" FROM "user_profile") AS "a") AS "X" GROUP BY "userId"`,
		);
		await queryRunner.query(
			`UPDATE "user_profile" SET "mutedWords" = "kws" FROM "MmVqAUUgpshTCQcw" WHERE "user_profile"."userId" = "MmVqAUUgpshTCQcw"."userId"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "mutedWords_old"`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" RENAME COLUMN "mutedInstances" TO "mutedInstances_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN "mutedInstances" jsonb NOT NULL DEFAULT '[]'`,
		);
		await queryRunner.query(
			`UPDATE "user_profile" SET "mutedInstances" = to_jsonb("mutedInstances_old")`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "mutedInstances_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" RENAME COLUMN "mutedWords" TO "mutedWords_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN "mutedWords" jsonb NOT NULL DEFAULT '[]'`,
		);
		await queryRunner.query(
			`CREATE TEMP TABLE "BCrsGgLCUeMMLARy" ("userId" character varying(32), "kws" jsonb NOT NULL DEFAULT '[]')`,
		);
		await queryRunner.query(
			`INSERT INTO "BCrsGgLCUeMMLARy" ("userId", "kws") SELECT "userId", jsonb_agg("X"."w") FROM (SELECT "userId", to_jsonb(string_to_array(unnest("mutedWords_old"), ' ')) AS "w" FROM "user_profile") AS "X" GROUP BY "userId"`,
		);
		await queryRunner.query(
			`UPDATE "user_profile" SET "mutedWords" = "kws" FROM "BCrsGgLCUeMMLARy" WHERE "user_profile"."userId" = "BCrsGgLCUeMMLARy"."userId"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "mutedWords_old"`,
		);
	}
}
