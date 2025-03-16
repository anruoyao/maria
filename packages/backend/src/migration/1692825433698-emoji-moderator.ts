import type { MigrationInterface, QueryRunner } from "typeorm";

export class EmojiModerator1692825433698 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."user_emojimodperm_enum" AS ENUM('unauthorized', 'add', 'mod', 'full')`,
		);
		await queryRunner.query(
			`ALTER TABLE "user" ADD "emojiModPerm" "public"."user_emojimodperm_enum" NOT NULL DEFAULT 'unauthorized'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emojiModPerm"`);
		await queryRunner.query(`DROP TYPE "public"."user_emojimodperm_enum"`);
	}
}
