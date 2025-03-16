import type Koa from "koa";
import rndstr from "rndstr";
import { verifyHcaptcha, verifyRecaptcha } from "@/misc/captcha.js";
import { Users, RegistrationTickets, UserPendings } from "@/models/index.js";
import { signup } from "@/server/api/common/signup.js";
import { config } from "@/config.js";
import { sendEmail } from "@/services/send-email.js";
import { fetchMeta, genIdAt, hashPassword } from "backend-rs";
import { validateEmailForAccount } from "@/services/validate-email-for-account.js";

export default async (ctx: Koa.Context) => {
	const body = ctx.request.body;

	const instanceMeta = await fetchMeta();

	// Verify *Captcha
	// ただしテスト時はこの機構は障害となるため無効にする
	if (process.env.NODE_ENV !== "test") {
		if (instanceMeta.enableHcaptcha && instanceMeta.hcaptchaSecretKey) {
			await verifyHcaptcha(
				instanceMeta.hcaptchaSecretKey,
				body["hcaptcha-response"],
			).catch((e) => {
				ctx.throw(400, e);
			});
		}

		if (instanceMeta.enableRecaptcha && instanceMeta.recaptchaSecretKey) {
			await verifyRecaptcha(
				instanceMeta.recaptchaSecretKey,
				body["g-recaptcha-response"],
			).catch((e) => {
				ctx.throw(400, e);
			});
		}
	}

	const username = body["username"];
	const password = body["password"];
	const host: string | null =
		process.env.NODE_ENV === "test" ? body["host"] || null : null;
	const invitationCode = body["invitationCode"];
	const emailAddress = body["emailAddress"];

	if (config.reservedUsernames?.includes(username.toLowerCase())) {
		ctx.status = 400;
		return;
	}

	if (instanceMeta.emailRequiredForSignup) {
		if (emailAddress == null || typeof emailAddress !== "string") {
			ctx.status = 400;
			return;
		}

		const { available } = await validateEmailForAccount(emailAddress);
		if (!available) {
			ctx.status = 400;
			return;
		}
	}

	if (instanceMeta.disableRegistration) {
		if (invitationCode == null || typeof invitationCode !== "string") {
			ctx.status = 400;
			return;
		}

		const ticket = await RegistrationTickets.findOneBy({
			code: invitationCode,
		});

		if (ticket == null) {
			ctx.status = 400;
			return;
		}

		RegistrationTickets.delete(ticket.id);
	}

	if (instanceMeta.emailRequiredForSignup) {
		const code = rndstr("a-z0-9", 16);

		// Generate hash of password
		const hash = hashPassword(password);

		const now = new Date();

		await UserPendings.insert({
			id: genIdAt(now),
			createdAt: now,
			code,
			email: emailAddress,
			username: username,
			password: hash,
		});

		const link = `${config.url}/signup-complete/${code}`;

		sendEmail(
			emailAddress,
			"Signup",
			`To complete signup, please click this link:<br><a href="${link}">${link}</a>`,
			`To complete signup, please click this link: ${link}`,
		);

		ctx.status = 204;
	} else {
		try {
			const { account, secret } = await signup({
				username,
				password,
				host,
			});

			const res = await Users.pack(account, account, {
				detail: true,
				includeSecrets: true,
			});

			(res as any).token = secret;

			ctx.body = res;
		} catch (e) {
			ctx.throw(400, e);
		}
	}
};
