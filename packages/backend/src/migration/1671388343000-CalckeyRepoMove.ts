import type { MigrationInterface, QueryRunner } from "typeorm";

/* "FirefishRepoMove1671388343000" is a class that updates the "useStarForReactionFallback" column in
the "meta" table to TRUE */
export class FirefishRepoMove1671388343000 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://github.com/buka5587/maria'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://github.com/buka5587/maria/issues'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://github.com/buka5587/maria'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://github.com/buka5587/maria/issues'`,
		);
	}
}
