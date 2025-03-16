import type { MigrationInterface, QueryRunner } from "typeorm";

export class addPropsForCustomEmoji1678945242650 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "emoji" ADD "license" character varying(1024)`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "license"`);
	}
}
