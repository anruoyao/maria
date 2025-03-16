import type { MigrationInterface, QueryRunner } from "typeorm";

export class Pgroonga1698420787202 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX "IDX_f27f5d88941e57442be75ba9c8" ON "note" USING "pgroonga" ("text")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_065d4d8f3b5adb4a08841eae3c" ON "user" USING "pgroonga" ("name" pgroonga_varchar_full_text_search_ops_v2)`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_fcb770976ff8240af5799e3ffc" ON "user_profile" USING "pgroonga" ("description" pgroonga_varchar_full_text_search_ops_v2) `,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_fcb770976ff8240af5799e3ffc"`);
		await queryRunner.query(`DROP INDEX "IDX_065d4d8f3b5adb4a08841eae3c"`);
		await queryRunner.query(`DROP INDEX "IDX_f27f5d88941e57442be75ba9c8"`);
	}
}
