import { generateKeyPair } from "node:crypto";
import { User } from "@/models/entities/user.js";
import { Users, UsedUsernames } from "@/models/index.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { IsNull } from "typeorm";
import {
	countLocalUsers,
	genIdAt,
	generateUserToken,
	hashPassword,
	toPuny,
} from "backend-rs";
import { UserKeypair } from "@/models/entities/user-keypair.js";
import { UsedUsername } from "@/models/entities/used-username.js";
import { db } from "@/db/postgre.js";
import { config } from "@/config.js";

export async function signup(opts: {
	username: User["username"];
	password?: string | null;
	passwordHash?: UserProfile["password"] | null;
	host?: string | null;
}) {
	const { username, password, passwordHash, host } = opts;
	let hash = passwordHash;

	const userCount = await countLocalUsers();

	if (config.maxUserSignups != null && userCount > config.maxUserSignups) {
		throw new Error("MAX_USERS_REACHED");
	}

	// Validate username
	if (!Users.validateLocalUsername(username)) {
		throw new Error("INVALID_USERNAME");
	}

	if (password != null && passwordHash == null) {
		// Validate password
		if (!Users.validatePassword(password)) {
			throw new Error("INVALID_PASSWORD");
		}

		// Generate hash of password
		hash = hashPassword(password);
	}

	// Generate secret
	const secret = generateUserToken();

	// Check username duplication
	if (
		await Users.findOneBy({
			usernameLower: username.toLowerCase(),
			host: IsNull(),
		})
	) {
		throw new Error("DUPLICATED_USERNAME");
	}

	// Check deleted username duplication
	if (await UsedUsernames.findOneBy({ username: username.toLowerCase() })) {
		throw new Error("USED_USERNAME");
	}

	const keyPair = await new Promise<string[]>((res, rej) =>
		generateKeyPair(
			"rsa",
			{
				modulusLength: 4096,
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
			} as any,
			(err, publicKey, privateKey) =>
				err ? rej(err) : res([publicKey, privateKey]),
		),
	);

	let account!: User;

	const exists = await Users.existsBy({
		usernameLower: username.toLowerCase(),
		host: IsNull(),
	});

	if (exists) {
		throw new Error("the username is already used");
	}

	// Start transaction
	await db.transaction(async (transactionalEntityManager) => {
		const now = new Date();

		account = await transactionalEntityManager.save(
			new User({
				id: genIdAt(now),
				createdAt: now,
				username: username,
				usernameLower: username.toLowerCase(),
				host: host == null ? null : toPuny(host),
				token: secret,
				isAdmin: (await countLocalUsers()) === 0,
			}),
		);

		await transactionalEntityManager.save(
			new UserKeypair({
				publicKey: keyPair[0],
				privateKey: keyPair[1],
				userId: account.id,
			}),
		);

		await transactionalEntityManager.save(
			new UserProfile({
				userId: account.id,
				autoAcceptFollowed: true,
				password: hash,
			}),
		);

		await transactionalEntityManager.save(
			new UsedUsername({
				createdAt: now,
				username: username.toLowerCase(),
			}),
		);
	});

	return { account, secret };
}
