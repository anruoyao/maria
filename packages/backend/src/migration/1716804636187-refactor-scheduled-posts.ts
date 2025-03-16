import type { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorScheduledPosts1716804636187 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "note" ADD COLUMN "scheduledAt" timestamp with time zone`,
		);
		await queryRunner.query(
			`CREATE TEMP TABLE "tmp_scheduled_note" (LIKE "note")`,
		);
		await queryRunner.query(
			`INSERT INTO "tmp_scheduled_note" (SELECT * FROM "note" WHERE "note"."id" IN (SELECT "noteId" FROM "scheduled_note"))`,
		);
		await queryRunner.query(
			`UPDATE "tmp_scheduled_note" SET "scheduledAt" = "scheduled_note"."scheduledAt" FROM "scheduled_note" WHERE "tmp_scheduled_note"."id" = "scheduled_note"."noteId"`,
		);
		await queryRunner.query(
			`DELETE FROM "note" WHERE "note"."id" IN (SELECT "noteId" FROM "scheduled_note")`,
		);
		await queryRunner.query(
			`INSERT INTO "note" SELECT * FROM "tmp_scheduled_note"`,
		);
		await queryRunner.query(`DROP TABLE "scheduled_note"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "scheduled_note" (
					"id" character varying(32) NOT NULL PRIMARY KEY,
					"noteId" character varying(32) NOT NULL,
					"userId" character varying(32) NOT NULL,
					"scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL
				)`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "scheduled_note"."noteId" IS 'The ID of the temporarily created note that corresponds to the schedule.'`,
		);
		// temp function to populate "scheduled_note"."id" with random values (as it's unused)
		await queryRunner.query("CREATE EXTENSION pgcrypto");
		await queryRunner.query(`
			CREATE FUNCTION generate_scheduled_note_id(size int) RETURNS text AS $$	DECLARE
				characters text := 'abcdefghijklmnopqrstuvwxyz0123456789';
				bytes bytea := gen_random_bytes(size);
				l int := length(characters);
				i int := 0;
				output text := '';
				BEGIN
					WHILE i < size LOOP
						output := output || substr(characters, get_byte(bytes, i) % l + 1, 1);
						i := i + 1;
					END LOOP;
					RETURN output;
				END;
			$$ LANGUAGE plpgsql VOLATILE;
		`);
		await queryRunner.query(
			`INSERT INTO "scheduled_note" ("id", "noteId", "userId", "scheduledAt") (SELECT generate_scheduled_note_id(16), "id", "userId", "scheduledAt" FROM "note" WHERE "note"."scheduledAt" IS NOT NULL)`,
		);
		await queryRunner.query("DROP EXTENSION pgcrypto");
		await queryRunner.query(`DROP FUNCTION "generate_scheduled_note_id"`);
		await queryRunner.query(
			`CREATE INDEX "IDX_noteId_ScheduledNote" ON "scheduled_note" ("noteId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_userId_ScheduledNote" ON "scheduled_note" ("userId")`,
		);
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
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "scheduledAt"`);
	}
}
