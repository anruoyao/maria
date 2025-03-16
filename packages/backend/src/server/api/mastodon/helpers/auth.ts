import type OAuth from "@/server/api/mastodon/entities/oauth/oauth.js";
import {
	fetchMeta,
	getTimestamp,
	generateSecureRandomString,
	genIdAt,
} from "backend-rs";
import { Apps, AccessTokens } from "@/models/index.js";
import type { MastoContext } from "@/server/api/mastodon/index.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { difference, toSingleLast, unique } from "@/prelude/array.js";
import type { ILocalUser } from "@/models/entities/user.js";
import type { App } from "@/models/entities/app";

export class AuthHelpers {
	public static async registerApp(
		ctx: MastoContext,
	): Promise<OAuth.Application> {
		const body: any = ctx.request.body || ctx.request.query;
		const scopes = (typeof body.scopes === "string"
			? body.scopes.split(" ")
			: body.scopes) ?? ["read"];
		// Mastodon takes any whitespace chars or line breaks as separator
		const redirect_uris = body.redirect_uris?.split(/[\s\n]/) as
			| string[]
			| undefined;
		const client_name = body.client_name;
		const website = body.website || "";

		if (client_name == null)
			throw new MastoApiError(400, "Missing client_name param");
		if (redirect_uris == null || redirect_uris.length < 1)
			throw new MastoApiError(400, "Missing redirect_uris param");

		try {
			redirect_uris.every((u) => this.validateRedirectUri(u));
		} catch {
			throw new MastoApiError(400, "Invalid redirect_uris");
		}

		let app: App;
		try {
			app = await Apps.findOneByOrFail({
				name: client_name,
				callbackUrl: redirect_uris.join("\n"),
				description: website,
				permission: scopes,
			});
		} catch {
			const createdAt = new Date();
			const id = genIdAt(createdAt);

			app = await Apps.insert({
				id,
				secret: generateSecureRandomString(32),
				createdAt,
				name: client_name,
				description: website,
				permission: scopes,
				callbackUrl: redirect_uris.join("\n"),
			}).then((x) => Apps.findOneByOrFail(x.identifiers[0]));
		}

		return {
			// Compatibility: ZonePane only accepts a small int as app ID
			id:
				app.name === "ZonePane"
					? getTimestamp(app.id)?.toString().substring(0, 6) ?? app.id
					: app.id,
			name: app.name,
			website: app.description,
			redirect_uri: app.callbackUrl ?? "",
			client_id: app.id,
			client_secret: app.secret,
			vapid_key:
				(await fetchMeta().then((meta) => meta.swPublicKey)) ?? undefined,
		};
	}

	public static async getAuthCode(ctx: MastoContext) {
		const user = ctx.miauth[0] as ILocalUser;
		if (!user) throw new MastoApiError(401, "Unauthorized");

		const body = ctx.request.body as any;
		const scopes: string[] = (typeof body.scopes === "string"
			? body.scopes.split(" ")
			: body.scopes) ?? ["read"];
		const clientId = toSingleLast(body.client_id);

		if (clientId == null)
			throw new MastoApiError(400, "No client_id provided for auth code");

		const app = await Apps.findOneBy({ id: clientId });

		this.validateRedirectUri(body.redirect_uri);
		if (!app) throw new MastoApiError(400, "client_id not found for auth code");
		if (!scopes.every((p) => app.permission.includes(p)))
			throw new MastoApiError(
				400,
				"Cannot request more scopes than application",
			);

		const callbackUrls = app.callbackUrl?.split("\n") ?? [];
		if (!callbackUrls.some((url) => url.startsWith(body.redirect_uri)))
			throw new MastoApiError(400, "Redirect URI not in list");
		const secret = generateSecureRandomString(32);
		const createdAt = new Date();
		const id = genIdAt(createdAt);
		const token = await AccessTokens.insert({
			name: app.name,
			description: app.description,
			id,
			token: secret,
			hash: secret,
			appId: app.id,
			userId: user.id,
			permission: scopes,
			createdAt,
			fetched: false,
		}).then((x) => AccessTokens.findOneByOrFail(x.identifiers[0]));

		return { code: token.token };
	}

	public static async getAppInfo(ctx: MastoContext) {
		const body = ctx.request.body as any;
		const clientId = toSingleLast(body.client_id);

		if (clientId == null)
			throw new MastoApiError(400, "No client_id provided for app info");

		const app = await Apps.findOneBy({ id: clientId });

		if (!app) throw new MastoApiError(400, "client_id not found for app info");

		return { name: app.name };
	}

	public static async getAuthToken(ctx: MastoContext) {
		const body: any = ctx.request.body || ctx.request.query;
		const scopes: string[] = (typeof body.scope === "string"
			? body.scope.replaceAll("+", " ").split(" ")
			: body.scope) ?? ["read"];
		const clientId = toSingleLast(body.client_id);
		const code = toSingleLast(body.code);

		const invalidScopeError = new MastoApiError(
			400,
			"invalid_scope",
			"The requested scope is invalid, unknown, or malformed.",
		);
		const invalidClientError = new MastoApiError(
			401,
			"invalid_client",
			"Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.",
		);

		if (clientId == null) throw invalidClientError;

		const app = await Apps.findOneBy({ id: clientId });

		this.validateRedirectUri(body.redirect_uri);
		if (body.grant_type === "authorization_code") {
			if (code == null) throw new MastoApiError(401, "Invalid code");
			const token = await AccessTokens.findOneBy({ token: code });
			if (!app || body.client_secret !== app.secret) throw invalidClientError;
			if (!token || app.id !== token.appId)
				throw new MastoApiError(401, "Invalid code");
			if (difference(scopes, app.permission).length > 0)
				throw invalidScopeError;
			if (!app.callbackUrl?.split("\n").includes(body.redirect_uri))
				throw new MastoApiError(400, "Redirect URI not in list");

			await AccessTokens.update(token.id, { fetched: true });

			return {
				access_token: token.token,
				token_type: "Bearer",
				scope: app.permission.join(" "),
				created_at: Math.floor(token.createdAt.getTime() / 1000),
			};
		} else if (body.grant_type === "client_credentials") {
			if (!app || body.client_secret !== app.secret) throw invalidClientError;
			if (difference(scopes, app.permission).length > 0)
				throw invalidScopeError;
			const createdAt = new Date();
			const id = genIdAt(createdAt);
			const secret = generateSecureRandomString(32);
			const token = await AccessTokens.insert({
				name: app.name,
				description: app.description,
				id,
				token: secret,
				hash: secret,
				appId: app.id,
				userId: null,
				permission: scopes,
				createdAt,
				fetched: false,
			}).then((x) => AccessTokens.findOneByOrFail(x.identifiers[0]));

			return {
				access_token: token.token,
				token_type: "Bearer",
				scope: app.permission.join(" "),
				created_at: Math.floor(token.createdAt.getTime() / 1000),
			};
		} else {
			throw new MastoApiError(400, "Invalid grant_type");
		}
	}

	public static async revokeAuthToken(ctx: MastoContext) {
		const error = new MastoApiError(
			403,
			"unauthorized_client",
			"You are not authorized to revoke this token",
		);
		const body: any = ctx.request.body || ctx.request.query;
		const clientId = toSingleLast(body.client_id);
		const clientSecret = toSingleLast(body.client_secret);
		const token = toSingleLast(body.token);

		if (clientId == null || clientSecret == null || token == null) throw error;

		const app = await Apps.findOneBy({ id: clientId, secret: clientSecret });
		const oatoken = await AccessTokens.findOneBy({ token: token });

		if (!app || !oatoken || app.id !== oatoken.appId) throw error;

		await AccessTokens.delete(oatoken.id);

		return {};
	}

	public static async verifyAppCredentials(ctx: MastoContext) {
		if (!ctx.appId) throw new MastoApiError(401, "The access token is invalid");
		const app = await Apps.findOneByOrFail({ id: ctx.appId });
		return {
			name: app.name,
			website: app.description,
			vapid_key: await fetchMeta().then(
				(meta) => meta.swPublicKey ?? undefined,
			),
		};
	}

	private static validateRedirectUri(redirectUri: string): void {
		const error = new MastoApiError(400, "Invalid redirect_uri");
		if (redirectUri == null) throw error;
		if (redirectUri === "urn:ietf:wg:oauth:2.0:oob") return;
		try {
			const url = new URL(redirectUri);
			if (
				["javascript:", "file:", "data:", "mailto:", "tel:"].includes(
					url.protocol,
				)
			)
				throw error;
		} catch {
			throw error;
		}
	}

	private static readScopes = [
		"read:accounts",
		"read:blocks",
		"read:bookmarks",
		"read:favourites",
		"read:filters",
		"read:follows",
		"read:lists",
		"read:mutes",
		"read:notifications",
		"read:search",
		"read:statuses",
	];
	private static writeScopes = [
		"write:accounts",
		"write:blocks",
		"write:bookmarks",
		"write:conversations",
		"write:favourites",
		"write:filters",
		"write:follows",
		"write:lists",
		"write:media",
		"write:mutes",
		"write:notifications",
		"write:reports",
		"write:statuses",
	];
	private static followScopes = [
		"read:follows",
		"read:blocks",
		"read:mutes",
		"write:follows",
		"write:blocks",
		"write:mutes",
	];
	private static adminReadScopes = [
		"admin:read:accounts",
		"admin:read:reports",
		"admin:read:domain_allows",
		"admin:read:domain_blocks",
		"admin:read:ip_blocks",
		"admin:read:email_domain_blocks",
		"admin:read:canonical_email_blocks",
	];
	private static adminWriteScopes = [
		"admin:write:accounts",
		"admin:write:reports",
		"admin:write:domain_allows",
		"admin:write:domain_blocks",
		"admin:write:ip_blocks",
		"admin:write:email_domain_blocks",
		"admin:write:canonical_email_blocks",
	];

	public static expandScopes(scopes: string[]): string[] {
		const res: string[] = [];

		for (const scope of scopes) {
			if (scope === "read") res.push(...this.readScopes);
			else if (scope === "write") res.push(...this.writeScopes);
			else if (scope === "follow") res.push(...this.followScopes);
			else if (scope === "admin:read") res.push(...this.adminReadScopes);
			else if (scope === "admin:write") res.push(...this.adminWriteScopes);

			res.push(scope);
		}

		return unique(res);
	}
}
