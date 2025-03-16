import type { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAkaType1714099399879 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" RENAME COLUMN "alsoKnownAs" TO "alsoKnownAsOld"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user" ADD COLUMN "alsoKnownAs" character varying(512)[]`,
		);
		await queryRunner.query(
			`UPDATE "user" SET "alsoKnownAs" = string_to_array("alsoKnownAsOld", ',')::character varying[]`,
		);
		await queryRunner.query(
			`UPDATE "user" SET "alsoKnownAs" = NULL WHERE "alsoKnownAs" = '{}'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "user"."alsoKnownAs" IS 'URIs the user is known as too'`,
		);
		await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "alsoKnownAsOld"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" RENAME COLUMN "alsoKnownAs" TO "alsoKnownAsOld"`,
		);
		await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "alsoKnownAs" text`);
		await queryRunner.query(
			`UPDATE "user" SET "alsoKnownAs" = array_to_string("alsoKnownAsOld", ',')`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "user"."alsoKnownAs" IS 'URIs the user is known as too'`,
		);
		await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "alsoKnownAsOld"`);
	}
}
