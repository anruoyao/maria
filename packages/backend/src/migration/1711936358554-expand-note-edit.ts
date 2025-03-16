import type { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandNoteEdit1711936358554 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "note_edit" ADD "emojis" character varying(128) array NOT NULL DEFAULT '{}'::varchar[]
		`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "note_edit" DROP COLUMN "emojis"
		`);
	}
}
