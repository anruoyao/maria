import { JSDOM } from "jsdom";
import { config } from "@/config.js";
import { intersperse } from "@/prelude/array.js";
import { resolveMentionFromCache } from "@/remote/resolve-user.js";
import type { IMentionedRemoteUsers } from "@/models/entities/note.js";
import type mfm from "mfm-js";
import type { MastoContext } from "..";

export class MfmHelpers {
	public static async toHtml(
		nodes: mfm.MfmNode[] | null,
		mentionedRemoteUsers: IMentionedRemoteUsers = [],
		objectHost: string | null = null,
		inline = false,
		quoteUri: string | null = null,
		ctx?: MastoContext,
	) {
		if (nodes == null) {
			return null;
		}

		const mastodonApp: string | null = ctx?.tokenApp?.name;

		const { window } = new JSDOM("");

		const doc = window.document;

		async function appendChildren(
			children: mfm.MfmNode[],
			targetElement: any,
		): Promise<void> {
			if (children) {
				for (const child of (
					await Promise.all(
						children.map(async (x) => await (handlers as any)[x.type](x)),
					)
				).flat())
					targetElement.appendChild(child);
			}
		}

		const handlers: {
			[K in mfm.MfmNode["type"]]: (node: mfm.NodeType<K>) => any;
		} = {
			async bold(node) {
				const el = doc.createElement("strong");
				await appendChildren(node.children, el);
				return [el];
			},

			async small(node) {
				const el = doc.createElement("small");
				await appendChildren(node.children, el);
				return [el];
			},

			async strike(node) {
				const el = doc.createElement("del");
				await appendChildren(node.children, el);
				return [el];
			},

			async italic(node) {
				const el = doc.createElement("em");
				await appendChildren(node.children, el);
				return [el];
			},

			async fn(node) {
				const el = doc.createElement("span");
				el.appendChild(
					doc.createTextNode(
						`${node.props.name}(${Object.entries(node.props.args)
							.map(([k, v]) => `${k}=${v}`)
							.join(", ")}`,
					),
				);
				await appendChildren(node.children, el);
				el.appendChild(doc.createTextNode(")"));
				return [el];
			},

			blockCode(node) {
				const pre = doc.createElement("pre");
				const inner = doc.createElement("code");
				inner.setAttribute("class", `language-${node.props.lang}`);

				const nodes = node.props.code
					.split(/\r\n|\r|\n/)
					.map((x) => doc.createTextNode(x));

				for (const x of intersperse<Text | "br">("br", nodes)) {
					inner.appendChild(x === "br" ? doc.createElement("br") : x);
				}

				pre.appendChild(inner);
				return [pre];
			},

			async center(node) {
				const el = doc.createElement("div");
				el.style.textAlign = "center";
				await appendChildren(node.children, el);
				return [el];
			},

			emojiCode(node) {
				return [doc.createTextNode(`\u200B:${node.props.name}:\u200B`)];
			},

			unicodeEmoji(node) {
				return [doc.createTextNode(node.props.emoji)];
			},

			hashtag(node) {
				const a = doc.createElement("a");
				a.setAttribute("href", `${config.url}/tags/${node.props.hashtag}`);
				a.textContent = `#${node.props.hashtag}`;
				a.setAttribute("rel", "tag");
				a.setAttribute("class", "hashtag");
				return [a];
			},

			inlineCode(node) {
				const el = doc.createElement("code");
				el.textContent = node.props.code;
				return [el];
			},

			mathInline(node) {
				const el = doc.createElement("code");
				el.textContent = node.props.formula;
				return [el];
			},

			mathBlock(node) {
				const el = doc.createElement("code");
				el.textContent = node.props.formula;
				return [el];
			},

			async link(node) {
				const a = doc.createElement("a");
				a.setAttribute("rel", "nofollow noopener noreferrer");
				a.setAttribute("target", "_blank");
				a.setAttribute("href", node.props.url);
				await appendChildren(node.children, a);
				return [a];
			},

			async mention(node) {
				const { username, host, acct } = node.props;
				const resolved = await resolveMentionFromCache(
					username,
					host,
					objectHost,
					mentionedRemoteUsers,
				);

				const el = doc.createElement("span");
				if (resolved === null) {
					el.textContent = acct;
				} else {
					el.setAttribute("class", "h-card");
					el.setAttribute("translate", "no");
					const a = doc.createElement("a");
					a.setAttribute("href", resolved.href);
					a.className = "u-url mention";
					const span = doc.createElement("span");
					span.textContent = resolved.username;
					if (!resolved.isLocal) {
						span.textContent += `@${resolved.host}`;
					}
					a.textContent = "@";
					a.appendChild(span);
					el.appendChild(a);
				}

				return [el];
			},

			async quote(node) {
				const el = doc.createElement("blockquote");
				await appendChildren(node.children, el);
				return [el];
			},

			text(node) {
				const result = [];
				const nodes = node.props.text
					.split(/\r\n|\r|\n/)
					.map((x) => doc.createTextNode(x));

				for (const x of intersperse<Text | "br">("br", nodes)) {
					result.push(x === "br" ? doc.createElement("br") : x);
				}

				return result;
			},

			url(node) {
				const a = doc.createElement("a");
				a.setAttribute("rel", "nofollow noopener noreferrer");
				a.setAttribute("target", "_blank");
				a.setAttribute("href", node.props.url);
				a.textContent = node.props.url.replace(/^https?:\/\//, "");
				return [a];
			},

			search(node) {
				const a = doc.createElement("a");
				a.setAttribute(
					"href",
					`https://www.google.com/search?q=${node.props.query}`,
				);
				a.textContent = node.props.content;
				return [a];
			},

			async plain(node) {
				const el = doc.createElement("span");
				await appendChildren(node.children, el);
				return [el];
			},
		};

		await appendChildren(nodes, doc.body);

		if (quoteUri !== null) {
			const a = doc.createElement("a");
			a.setAttribute("href", quoteUri);
			a.textContent = quoteUri.replace(/^https?:\/\//, "");

			const quote = doc.createElement("span");
			quote.setAttribute("class", "quote-inline");
			quote.appendChild(doc.createElement("br"));
			quote.appendChild(doc.createElement("br"));
			quote.innerHTML += "RE: ";
			quote.appendChild(a);

			doc.body.appendChild(quote);
		}

		return inline ? doc.body.innerHTML : `<p>${doc.body.innerHTML}</p>`;
	}
}
