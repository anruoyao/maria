import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixChatFileConstraint1712855579316 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "messaging_message" DROP CONSTRAINT "FK_535def119223ac05ad3fa9ef64b"`,
		);
		await queryRunner.query(
			`ALTER TABLE "messaging_message" ADD CONSTRAINT "FK_535def119223ac05ad3fa9ef64b" FOREIGN KEY ("fileId") REFERENCES "drive_file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "messaging_message" DROP CONSTRAINT "FK_535def119223ac05ad3fa9ef64b"`,
		);
		await queryRunner.query(
			`ALTER TABLE "messaging_message" ADD CONSTRAINT "FK_535def119223ac05ad3fa9ef64b" FOREIGN KEY ("fileId") REFERENCES "drive_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}
}
