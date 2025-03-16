import type { MigrationInterface, QueryRunner } from "typeorm";

export class SeparateHardMuteWordsAndPatterns1706413792769
	implements MigrationInterface
{
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "mutedPatterns" text[] DEFAULT '{}'`,
		);
		await queryRunner.query(`
			UPDATE "user_profile" SET
				"mutedPatterns" = ARRAY(
					SELECT jsonb_array_elements_text(jsonb_path_query_array(
						"mutedWords",
						'$ ? (@.type() == "string")'
					))
				),
				"mutedWords" = jsonb_path_query_array(
					"mutedWords",
					'$ ? (@.type() == "array")'
				)
        `);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER "mutedPatterns" SET NOT NULL`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "user_profile" SET "mutedWords" = "mutedWords" || array_to_json("mutedPatterns")::jsonb`,
		);
		await queryRunner.query(`ALTER TABLE "user_profile" DROP "mutedPatterns"`);
	}
}
