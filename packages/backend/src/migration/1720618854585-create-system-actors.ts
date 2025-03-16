import type { MigrationInterface, QueryRunner } from "typeorm";

import { v4 as uuid } from "uuid";
import { generateUserToken, genIdAt, hashPassword } from "backend-rs";

import * as crypto from "node:crypto";
import * as util from "node:util";

const generateKeyPair = util.promisify(crypto.generateKeyPair);

async function genRsaKeyPair(modulusLength = 2048) {
	return await generateKeyPair("rsa", {
		modulusLength,
		publicKeyEncoding: {
			type: "spki",
			format: "pem",
		},
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
			cipher: undefined,
			passphrase: undefined,
		},
	});
}

async function createSystemUser(username: string, queryRunner: QueryRunner) {
	const password = uuid();

	// Generate hash of password
	const hash = hashPassword(password);

	// Generate secret
	const secret = generateUserToken();

	const keyPair = await genRsaKeyPair(4096);

	const existsQuery = await queryRunner.query(
		`SELECT "usernameLower" FROM "user" WHERE "usernameLower" = $1 AND "host" IS NULL`,
		[username.toLowerCase()],
	);
	if (existsQuery.length) {
		return;
	}

	const now = new Date();

	await queryRunner.query(
		`INSERT INTO "user" (
			"id", "createdAt", "username", "usernameLower", "host", "token", 
			"isAdmin", "isLocked", "isExplorable", "isBot"
		)
		VALUES (
			$1, $2, $3, $4, NULL, 
			$5, FALSE, TRUE, FALSE, TRUE
		)`,
		[genIdAt(now), now, username, username.toLowerCase(), secret],
	);

	const account = await queryRunner.query(
		`SELECT * FROM "user" WHERE "usernameLower" = $1 AND "host" IS NULL`,
		[username.toLowerCase()],
	);
	if (!account.length) {
		throw new Error("Account not found");
	}

	await queryRunner.query(
		`INSERT INTO "user_keypair" ("publicKey", "privateKey", "userId")
		VALUES ($1, $2, $3)`,
		[keyPair.publicKey, keyPair.privateKey, account[0].id],
	);

	await queryRunner.query(
		`INSERT INTO "user_profile" ("userId", "autoAcceptFollowed", "password")
		VALUES ($1, FALSE, $2)`,
		[account[0].id, hash],
	);

	await queryRunner.query(
		`INSERT INTO "used_username" ("createdAt", "username")
		VALUES ($1, $2)`,
		[now, username.toLowerCase()],
	);
}

export class CreateSystemActors1720618854585 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await createSystemUser("instance.actor", queryRunner);
		await createSystemUser("relay.actor", queryRunner);
	}

	public async down(_: QueryRunner): Promise<void> {
		/* You don't need to revert this migration. */
	}
}
