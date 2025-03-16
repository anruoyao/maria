import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddDriveFileUsage1713451569342 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE drive_file_usage_hint_enum AS ENUM ('userAvatar', 'userBanner')`,
		);
		await queryRunner.query(
			`ALTER TABLE "drive_file" ADD "usageHint" drive_file_usage_hint_enum DEFAULT NULL`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "drive_file" DROP COLUMN "usageHint"`);
		await queryRunner.query(`DROP TYPE drive_file_usage_hint_enum`);
	}
}
