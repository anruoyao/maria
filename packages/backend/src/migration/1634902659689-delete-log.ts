import type { MigrationInterface, QueryRunner } from "typeorm";

export class deleteLog1634902659689 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "log"`);
	}
	async down(queryRunner: QueryRunner): Promise<void> {}
}
