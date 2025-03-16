import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixMutingIndices1710690239308 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_renote_muting_createdAt"`);
		await queryRunner.query(`DROP INDEX "IDX_renote_muting_muteeId"`);
		await queryRunner.query(`DROP INDEX "IDX_renote_muting_muterId"`);
		await queryRunner.query(`DROP INDEX "IDX_reply_muting_createdAt"`);
		await queryRunner.query(`DROP INDEX "IDX_reply_muting_muteeId"`);
		await queryRunner.query(`DROP INDEX "IDX_reply_muting_muterId"`);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_createdAt" ON "renote_muting" ("createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_muteeId" ON "renote_muting" ("muteeId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_muterId" ON "renote_muting" ("muterId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_reply_muting_createdAt" ON "reply_muting" ("createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_reply_muting_muteeId" ON "reply_muting" ("muteeId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_reply_muting_muterId" ON "reply_muting" ("muterId")`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_renote_muting_createdAt"`);
		await queryRunner.query(`DROP INDEX "IDX_renote_muting_muteeId"`);
		await queryRunner.query(`DROP INDEX "IDX_renote_muting_muterId"`);
		await queryRunner.query(`DROP INDEX "IDX_reply_muting_createdAt"`);
		await queryRunner.query(`DROP INDEX "IDX_reply_muting_muteeId"`);
		await queryRunner.query(`DROP INDEX "IDX_reply_muting_muterId"`);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_createdAt" ON "muting" ("createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_muteeId" ON "muting" ("muteeId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_muterId" ON "muting" ("muterId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_reply_muting_createdAt" ON "muting" ("createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_reply_muting_muteeId" ON "muting" ("muteeId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_reply_muting_muterId" ON "muting" ("muterId")`,
		);
	}
}
