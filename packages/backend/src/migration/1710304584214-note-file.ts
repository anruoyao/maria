import type { MigrationInterface, QueryRunner } from "typeorm";

export class NoteFile1710304584214 implements MigrationInterface {
	name = "NoteFile1710304584214";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "note_file" (
				"serialNo" bigserial PRIMARY KEY,
				"noteId" varchar(32) NOT NULL,
				"fileId" varchar(32) NOT NULL
			)`,
		);
		await queryRunner.query(`
			INSERT INTO "note_file" ("noteId", "fileId")
			SELECT "t"."id", "t"."fid" FROM (
				SELECT ROW_NUMBER() OVER () AS "rn", * FROM (
					SELECT "id", UNNEST("fileIds") AS "fid" FROM "note"
				) AS "s"
			) AS "t"
			INNER JOIN "drive_file" ON "drive_file"."id" = "t"."fid"
			ORDER BY "rn"
		`);
		await queryRunner.query(
			`ALTER TABLE "note_file" ADD FOREIGN KEY ("noteId") REFERENCES "note" ("id") ON DELETE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "note_file" ADD FOREIGN KEY ("fileId") REFERENCES "drive_file" ("id") ON DELETE CASCADE`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_note_file_noteId" ON "note_file" ("noteId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_note_file_fileId" ON "note_file" ("fileId")`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "note_file"`);
	}
}
