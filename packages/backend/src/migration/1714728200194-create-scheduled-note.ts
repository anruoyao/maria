import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateScheduledNote1714728200194 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "scheduled_note" (
				"id" character varying(32) NOT NULL PRIMARY KEY,
				"noteId" character varying(32) NOT NULL,
				"userId" character varying(32) NOT NULL,
				"scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL
		)`,
		);
		await queryRunner.query(`
			COMMENT ON COLUMN "scheduled_note"."noteId" IS 'The ID of the temporarily created note that corresponds to the schedule.'
		`);
		await queryRunner.query(`
			CREATE INDEX "IDX_noteId_ScheduledNote" ON "scheduled_note" ("noteId")
		`);
		await queryRunner.query(`
			CREATE INDEX "IDX_userId_ScheduledNote" ON "scheduled_note" ("userId")
		`);
		await queryRunner.query(`
			ALTER TABLE "scheduled_note"
			ADD FOREIGN KEY ("noteId") REFERENCES "note"("id")
			ON DELETE CASCADE
			ON UPDATE NO ACTION
		`);
		await queryRunner.query(`
			ALTER TABLE "scheduled_note"
			ADD FOREIGN KEY ("userId") REFERENCES "user"("id")
			ON DELETE CASCADE
			ON UPDATE NO ACTION
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "scheduled_note"`);
	}
}
