import type { MigrationInterface, QueryRunner } from "typeorm";

export class IndexAltTextAndCw1708872574733 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX "IDX_8e3bbbeb3df04d1a8105da4c8f" ON "note" USING "pgroonga" ("cw" pgroonga_varchar_full_text_search_ops_v2)`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_f4f7b93d05958527300d79ac82" ON "drive_file" USING "pgroonga" ("comment" pgroonga_varchar_full_text_search_ops_v2)`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_f4f7b93d05958527300d79ac82"`);
		await queryRunner.query(`DROP INDEX "IDX_8e3bbbeb3df04d1a8105da4c8f"`);
	}
}
