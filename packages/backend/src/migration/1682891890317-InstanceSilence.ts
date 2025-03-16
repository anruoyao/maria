import type { MigrationInterface, QueryRunner } from "typeorm";

export class InstanceSilence1682891890317 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "silencedHosts" character varying(256) array NOT NULL DEFAULT '{}'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "silencedHosts"`);
	}
}
