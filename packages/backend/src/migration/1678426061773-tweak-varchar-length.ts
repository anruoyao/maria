import type { MigrationInterface, QueryRunner } from "typeorm";

export class tweakVarcharLength1678426061773 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "smtpUser" TYPE character varying(1024)`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "smtpPass" TYPE character varying(1024)`,
			undefined,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {}
}
