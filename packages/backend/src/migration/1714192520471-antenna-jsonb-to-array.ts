import type { MigrationInterface, QueryRunner } from "typeorm";

export class AntennaJsonbToArray1714192520471 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "antenna" RENAME COLUMN "instances" TO "instances_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD COLUMN "instances" character varying(512)[] NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "instances" = ARRAY(SELECT jsonb_array_elements_text("instances_old"))::character varying(512)[]`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "instances" = '{}' WHERE "instances" = '{""}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" DROP COLUMN "instances_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" RENAME COLUMN "keywords" TO "keywords_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD COLUMN "keywords" text[] NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE TEMP TABLE "HMyeXPcdtQYGsSrf" ("id" character varying(32), "kws" text[])`,
		);
		await queryRunner.query(
			`INSERT INTO "HMyeXPcdtQYGsSrf" ("id", "kws")	SELECT "id", array_agg("X"."w") FROM (SELECT "id", array_to_string(ARRAY(SELECT jsonb_array_elements_text("kw")), ' ') AS "w" FROM (SELECT "id", jsonb_array_elements("keywords_old") AS "kw" FROM "antenna") AS "a") AS "X" GROUP BY "id"`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "keywords" = "kws" FROM "HMyeXPcdtQYGsSrf" WHERE "antenna"."id" = "HMyeXPcdtQYGsSrf"."id"`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "keywords" = '{}' WHERE "keywords" = '{""}'`,
		);
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "keywords_old"`);
		await queryRunner.query(
			`ALTER TABLE "antenna" RENAME COLUMN "excludeKeywords" TO "excludeKeywords_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD COLUMN "excludeKeywords" text[] NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE TEMP TABLE "kpdsACdZTRYqLkfK" ("id" character varying(32), "kws" text[])`,
		);
		await queryRunner.query(
			`INSERT INTO "kpdsACdZTRYqLkfK" ("id", "kws")	SELECT "id", array_agg("X"."w") FROM (SELECT "id", array_to_string(ARRAY(SELECT jsonb_array_elements_text("kw")), ' ') AS "w" FROM (SELECT "id", jsonb_array_elements("excludeKeywords_old") AS "kw" FROM "antenna") AS "a") AS "X" GROUP BY "id"`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "excludeKeywords" = "kws" FROM "kpdsACdZTRYqLkfK" WHERE "antenna"."id" = "kpdsACdZTRYqLkfK"."id"`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "excludeKeywords" = '{}' WHERE "excludeKeywords" = '{""}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" DROP COLUMN "excludeKeywords_old"`,
		);
	}
	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "antenna" SET "instances" = '{""}' WHERE "instances" = '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" RENAME COLUMN "instances" TO "instances_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD COLUMN "instances" jsonb NOT NULL DEFAULT '[]'`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "instances" = to_jsonb("instances_old")`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" DROP COLUMN "instances_old"`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "keywords" = '{""}' WHERE "keywords" = '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" RENAME COLUMN "keywords" TO "keywords_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD COLUMN "keywords" jsonb NOT NULL DEFAULT '[]'`,
		);
		await queryRunner.query(
			`CREATE TEMP TABLE "QvPNcMitBFkqqBgm" ("id" character varying(32), "kws" jsonb NOT NULL DEFAULT '[]')`,
		);
		await queryRunner.query(
			`INSERT INTO "QvPNcMitBFkqqBgm" ("id", "kws") SELECT "id", jsonb_agg("X"."w") FROM (SELECT "id", to_jsonb(string_to_array(unnest("keywords_old"), ' ')) AS "w" FROM "antenna") AS "X" GROUP BY "id"`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "keywords" = "kws" FROM "QvPNcMitBFkqqBgm" WHERE "antenna"."id" = "QvPNcMitBFkqqBgm"."id"`,
		);
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "keywords_old"`);
		await queryRunner.query(
			`UPDATE "antenna" SET "excludeKeywords" = '{""}' WHERE "excludeKeywords" = '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" RENAME COLUMN "excludeKeywords" TO "excludeKeywords_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD COLUMN "excludeKeywords" jsonb NOT NULL DEFAULT '[]'`,
		);
		await queryRunner.query(
			`CREATE TEMP TABLE "MZvVSjHzYcGXmGmz" ("id" character varying(32), "kws" jsonb NOT NULL DEFAULT '[]')`,
		);
		await queryRunner.query(
			`INSERT INTO "MZvVSjHzYcGXmGmz" ("id", "kws") SELECT "id", jsonb_agg("X"."w") FROM (SELECT "id", to_jsonb(string_to_array(unnest("excludeKeywords_old"), ' ')) AS "w" FROM "antenna") AS "X" GROUP BY "id"`,
		);
		await queryRunner.query(
			`UPDATE "antenna" SET "excludeKeywords" = "kws" FROM "MZvVSjHzYcGXmGmz" WHERE "antenna"."id" = "MZvVSjHzYcGXmGmz"."id"`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" DROP COLUMN "excludeKeywords_old"`,
		);
	}
}
