import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddReplyMuting1704851359889 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "reply_muting" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "muteeId" character varying(32) NOT NULL, "muterId" character varying(32) NOT NULL, CONSTRAINT "PK_replyMuting_id" PRIMARY KEY ("id"))`,
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
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "reply_muting"`);
	}
}
