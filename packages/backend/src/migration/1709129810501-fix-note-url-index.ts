import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixNoteUrlIndex1709129810501 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_note_url"`);
		await queryRunner.query(`CREATE INDEX "IDX_note_url" ON "note" ("url")`);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		/* You don't revert this migration */
	}
}
