import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveNativeUtilsMigration1705877093218
	implements MigrationInterface
{
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "reversi_game"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "reversi_matching"`);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_note_url" ON "note" ("url")`,
		);
		await queryRunner.query(`DROP TABLE IF EXISTS "antenna_note"`);
		await queryRunner.query(
			`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isIndexable" boolean NOT NULL DEFAULT true`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN IF NOT EXISTS "isIndexable" boolean NOT NULL DEFAULT true`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "enableTwitterIntegration"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "twitterConsumerKey"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "twitterConsumerSecret"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "enableGithubIntegration"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "githubClientId"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "githubClientSecret"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "enableDiscordIntegration"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "discordClientId"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "discordClientSecret"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN IF EXISTS "integrations"`,
		);
		await queryRunner.query(`DROP TABLE IF EXISTS "seaql_migrations"`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE IF NOT EXISTS "seaql_migrations" (version character varying NOT NULL, applied_at bigint NOT NULL)`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN IF NOT EXISTS "integrations" jsonb DEFAULT '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "discordClientSecret" character varying(128)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "discordClientId" character varying(128)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "enableDiscordIntegration" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "githubClientSecret" character varying(128)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "githubClientId" character varying(128)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "enableGithubIntegration" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "twitterConsumerSecret" character varying(128)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "twitterConsumerKey" character varying(128)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "enableTwitterIntegration" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN IF EXISTS "isIndexable"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user" DROP COLUMN IF EXISTS "isIndexable"`,
		);
		await queryRunner.query(
			`CREATE TABLE IF NOT EXISTS "antenna_note" ("id" character varying(32) NOT NULL, "noteId" character varying(32) NOT NULL, "antennaId" character varying(32) NOT NULL, "read" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_fb28d94d0989a3872df19fd6ef8" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_0d775946662d2575dfd2068a5f" ON "antenna_note" ("antennaId")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_bd0397be22147e17210940e125" ON "antenna_note" ("noteId")`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_335a0bf3f904406f9ef3dd51c2" ON "antenna_note" ("noteId", "antennaId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_9937ea48d7ae97ffb4f3f063a4" ON "antenna_note" ("read")`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna_note" ADD CONSTRAINT "FK_0d775946662d2575dfd2068a5f5" FOREIGN KEY ("antennaId") REFERENCES "antenna"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna_note" ADD CONSTRAINT "FK_bd0397be22147e17210940e125b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_note_url"`);
		await queryRunner.query(
			`CREATE TABLE IF NOT EXISTS "reversi_matching" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "parentId" character varying(32) NOT NULL, "childId" character varying(32) NOT NULL, CONSTRAINT "PK_880bd0afbab232f21c8b9d146cf" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_b604d92d6c7aec38627f6eaf16" ON "reversi_matching" ("createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_3b25402709dd9882048c2bbade" ON "reversi_matching" ("parentId")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_e247b23a3c9b45f89ec1299d06" ON "reversi_matching" ("childId")`,
		);
		await queryRunner.query(
			`ALTER TABLE "reversi_matching" ADD CONSTRAINT "FK_3b25402709dd9882048c2bbade0" FOREIGN KEY ("parentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "reversi_matching" ADD CONSTRAINT "FK_e247b23a3c9b45f89ec1299d066" FOREIGN KEY ("childId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "reversi_matching"."createdAt" IS 'The created date of the ReversiMatching.'`,
		);
		await queryRunner.query(
			`CREATE TABLE IF NOT EXISTS "reversi_game" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE, "user1Id" character varying(32) NOT NULL, "user2Id" character varying(32) NOT NULL, "user1Accepted" boolean NOT NULL DEFAULT false, "user2Accepted" boolean NOT NULL DEFAULT false, "black" integer, "isStarted" boolean NOT NULL DEFAULT false, "isEnded" boolean NOT NULL DEFAULT false, "winnerId" character varying(32), "surrendered" character varying(32), "logs" jsonb NOT NULL DEFAULT '[]', "map" character varying(64) array NOT NULL, "bw" character varying(32) NOT NULL, "isLlotheo" boolean NOT NULL DEFAULT false, "canPutEverywhere" boolean NOT NULL DEFAULT false, "loopedBoard" boolean NOT NULL DEFAULT false, "form1" jsonb DEFAULT null, "form2" jsonb DEFAULT null, "crc32" character varying(32), CONSTRAINT "PK_76b30eeba71b1193ad7c5311c3f" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_b46ec40746efceac604142be1c" ON "reversi_game" ("createdAt")`,
		);
		await queryRunner.query(
			`ALTER TABLE "reversi_game" ADD CONSTRAINT "FK_f7467510c60a45ce5aca6292743" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "reversi_game" ADD CONSTRAINT "FK_6649a4e8c5d5cf32fb03b5da9f6" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "reversi_game"."createdAt" IS 'The created date of the ReversiGame.'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "reversi_game"."startedAt" IS 'The started date of the ReversiGame.'`,
		);
	}
}
