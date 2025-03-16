import type { ILocalUser } from "@/models/entities/user.js";
import type { MastoContext } from "@/server/api/mastodon/index.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { Apps, AccessTokens } from "@/models/index.js";
import authenticate from "@/server/api/authenticate.js";
import { AuthHelpers } from "@/server/api/mastodon/helpers/auth.js";
import type { AccessToken } from "@/models/entities/access-token";

export async function AuthMiddleware(
	ctx: MastoContext,
	next: () => Promise<any>,
) {
	const token = await getTokenFromOAuth(ctx.headers.authorization);
	const app = token?.appId ? await Apps.findOneBy({ id: token.appId }) : null;

	ctx.appId = token?.appId;
	ctx.tokenApp = app;
	ctx.user = token?.user ?? (null as ILocalUser | null);
	ctx.scopes = token?.permission ?? ([] as string[]);
	ctx.tokenId = token?.id;

	await next();
}

export async function getTokenFromOAuth(
	authorization: string | undefined,
): Promise<AccessToken | null> {
	if (authorization == null) return null;

	if (authorization.substring(0, 7).toLowerCase() === "bearer ")
		authorization = authorization.substring(7);

	const token = await AccessTokens.findOne({
		where: { token: authorization },
		relations: ["user"],
	});

	if (!token || !token.appId) return null;

	const app = await Apps.findOneByOrFail({ id: token.appId });

	if (!app) return null;

	return {
		...token,
		permission: AuthHelpers.expandScopes(app.permission),
	};
}

export function auth(required: boolean, scopes: string[] = []) {
	return async function auth(ctx: MastoContext, next: () => Promise<any>) {
		if (required && !ctx.user)
			throw new MastoApiError(
				401,
				"This method requires an authenticated user",
			);

		if (!scopes.every((p) => ctx.scopes.includes(p))) {
			if (required)
				throw new MastoApiError(
					403,
					"This action is outside the authorized scopes",
				);

			ctx.user = null;
			ctx.scopes = [];
		}

		await next();
	};
}

export function MiAuth(required: boolean) {
	return async function MiAuth(ctx: MastoContext, next: () => Promise<any>) {
		ctx.miauth = await authenticate(
			ctx.headers.authorization,
			null,
			true,
		).catch((_) => [null, null]);
		if (required && !ctx.miauth[0])
			throw new MastoApiError(401, "Unauthorized");
		await next();
	};
}
