import type { MigrationInterface, QueryRunner } from "typeorm";

export class DropUnusedIndexes1714643926317 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_01f4581f114e0ebd2bbb876f0b"`);
		await queryRunner.query(`DROP INDEX "IDX_0610ebcfcfb4a18441a9bcdab2"`);
		await queryRunner.query(`DROP INDEX "IDX_25dfc71b0369b003a4cd434d0b"`);
		await queryRunner.query(`DROP INDEX "IDX_2710a55f826ee236ea1a62698f"`);
		await queryRunner.query(`DROP INDEX "IDX_4c02d38a976c3ae132228c6fce"`);
		await queryRunner.query(`DROP INDEX "IDX_51c063b6a133a9cb87145450f5"`);
		await queryRunner.query(`DROP INDEX "IDX_54ebcb6d27222913b908d56fd8"`);
		await queryRunner.query(`DROP INDEX "IDX_7fa20a12319c7f6dc3aed98c0a"`);
		await queryRunner.query(`DROP INDEX "IDX_88937d94d7443d9a99a76fa5c0"`);
		await queryRunner.query(`DROP INDEX "IDX_b11a5e627c41d4dc3170f1d370"`);
		await queryRunner.query(`DROP INDEX "IDX_c8dfad3b72196dd1d6b5db168a"`);
		await queryRunner.query(`DROP INDEX "IDX_d57f9030cd3af7f63ffb1c267c"`);
		await queryRunner.query(`DROP INDEX "IDX_e5848eac4940934e23dbc17581"`);
		await queryRunner.query(`DROP INDEX "IDX_fa99d777623947a5b05f394cae"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX "IDX_01f4581f114e0ebd2bbb876f0b" ON "note_reaction" ("createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_0610ebcfcfb4a18441a9bcdab2" ON "poll" ("userId")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_25dfc71b0369b003a4cd434d0b" ON "note" ("attachedFileTypes")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_2710a55f826ee236ea1a62698f" ON "hashtag" ("mentionedUsersCount")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_4c02d38a976c3ae132228c6fce" ON "hashtag" ("mentionedRemoteUsersCount")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_51c063b6a133a9cb87145450f5" ON "note" ("fileIds")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_54ebcb6d27222913b908d56fd8" ON "note" ("mentions")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_7fa20a12319c7f6dc3aed98c0a" ON "poll" ("userHost")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_88937d94d7443d9a99a76fa5c0" ON "note" ("tags")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_b11a5e627c41d4dc3170f1d370" ON "notification" ("createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_c8dfad3b72196dd1d6b5db168a" ON "drive_file" ("createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_d57f9030cd3af7f63ffb1c267c" ON "hashtag" ("attachedUsersCount")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_e5848eac4940934e23dbc17581" ON "drive_file" ("uri")`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_fa99d777623947a5b05f394cae" ON "user" ("tags")`,
		);
	}
}
