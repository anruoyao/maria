import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixFirefish1658981842728 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "meta" SET "useStarForReactionFallback" = TRUE;`,
		);
		await queryRunner.query(
			`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/buka5587/maria'`,
		);
		await queryRunner.query(
			`UPDATE "meta" SET "feedbackUrl" = 'https://github.com/buka5587/maria/issues'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "meta" SET "useStarForReactionFallback" = FALSE;`,
		);
		await queryRunner.query(
			`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/buka5587/maria'`,
		);
		await queryRunner.query(
			`UPDATE "meta" SET "feedbackUrl" = 'https://github.com/buka5587/maria/issues'`,
		);
	}
}
