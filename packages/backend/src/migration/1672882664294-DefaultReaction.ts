import type { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultReaction1672882664294 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "defaultReaction" character varying(256) NOT NULL DEFAULT '⭐'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "meta"."defaultReaction" IS 'The fallback reaction for emoji reacts'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "defaultReaction"`);
	}
}
