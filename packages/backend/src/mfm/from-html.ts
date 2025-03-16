import { URL } from "node:url";
import * as parse5 from "parse5";
import * as TreeAdapter from "../../node_modules/parse5/dist/tree-adapters/default.js";

const treeAdapter = TreeAdapter.defaultTreeAdapter;

const urlRegex = /^https?:\/\/[\w\/:%#@$&?!()\[\]~.,=+\-]+/;
const urlRegexFull = /^https?:\/\/[\w\/:%#@$&?!()\[\]~.,=+\-]+$/;

const MAX_FLAT = 100;

export function fromHtml(html: string, hashtagNames?: string[]): string {
	// some AP servers like Pixelfed use br tags as well as newlines
	const dom = parse5.parseFragment(html.replace(/<br\s?\/?>\r?\n/gi, "\n"));

	return toMFM(dom.childNodes);

	function toMFM(childNodes: TreeAdapter.ChildNode[], background = ""): string {
		return appendChildren(childNodes, background).join("").trim();
	}

	/**
	 * We only exclude text containing asterisks, since the other marks can almost be considered intentionally used.
	 */
	function escapeAmbiguousMfmMarks(text: string) {
		return text.includes("*") ? `<plain>${text}</plain>` : text;
	}

	/**
	 * Get only the text, ignoring all formatting inside
	 * @param node
	 * @returns
	 */
	function getText(node: TreeAdapter.Node): string {
		if (treeAdapter.isTextNode(node)) return node.value;
		if (!treeAdapter.isElementNode(node)) return "";
		if (node.nodeName === "br") return "\n";

		if (node.childNodes) {
			return node.childNodes.map((n) => getText(n)).join("");
		}

		return "";
	}

	function appendChildren(
		childNodes: TreeAdapter.ChildNode[],
		background = "",
	): string[] {
		if (childNodes) {
			return childNodes
				.map((n, index) => analyze(n, index + 1, background))
				.flat(MAX_FLAT);
		} else {
			return [""];
		}
	}

	/**
	 *
	 * @param node
	 * @param index
	 * @param background Determine whether the context is `<ul>` or `<ol>`
	 * @returns
	 */
	function analyze(
		node: TreeAdapter.Node,
		index = 1,
		background = "",
	): (string | string[])[] {
		if (treeAdapter.isTextNode(node)) {
			return [escapeAmbiguousMfmMarks(node.value)];
		}

		// Skip comment or document type node
		if (!treeAdapter.isElementNode(node)) return [];

		switch (node.nodeName) {
			case "br": {
				return ["\n"];
			}

			case "a": {
				const txt = getText(node);
				const rel = node.attrs.find((x) => x.name === "rel");
				const href = node.attrs.find((x) => x.name === "href");

				// hashtag
				if (
					hashtagNames &&
					href &&
					hashtagNames.map((x) => x.toLowerCase()).includes(txt.toLowerCase())
				) {
					return [txt];
					// mention
				} else if (txt.startsWith("@") && !rel?.value.match(/^me /)) {
					const part = txt.split("@");

					if (part.length === 2 && href) {
						//#region The host name part is omitted, so restore it.
						return [`${txt}@${new URL(href.value).hostname}`];
						//#endregion
					} else if (part.length === 3) {
						return [txt];
					}
					// その他
				} else {
					if (!(href || txt)) {
						return [""];
					}
					if (!href) {
						return [txt];
					}
					if (!txt || txt === href.value) {
						// #6383: Missing text node
						if (href.value.match(urlRegexFull)) {
							return [href.value];
						} else {
							return [`<${href.value}>`];
						}
					}
					if (href.value.match(urlRegex) && !href.value.match(urlRegexFull)) {
						return [`[${txt}](<${href.value}>)`]; // #6846
					} else {
						return [`[${txt}](${href.value})`];
					}
				}
				break;
			}

			case "h1": {
				return ["\n\n", "**$[x2 ", appendChildren(node.childNodes), " ]**"];
			}

			case "h2":
			case "h3": {
				return ["\n\n", "**", appendChildren(node.childNodes), "**"];
			}

			case "b":
			case "strong": {
				return ["**", appendChildren(node.childNodes), "**"];
			}

			case "small": {
				return ["<small>", appendChildren(node.childNodes), "</small>"];
			}

			case "s":
			case "del": {
				return ["~~", appendChildren(node.childNodes), "~~"];
			}

			case "i":
			case "em": {
				return ["<i>", appendChildren(node.childNodes), "</i>"];
			}

			// block code (<pre><code>)
			case "pre": {
				if (
					node.childNodes.length === 1 &&
					node.childNodes[0].nodeName === "code"
				) {
					return [
						"\n```\n",
						getText(node.childNodes[0]), // obviously get raw text
						"\n```\n",
					];
				} else {
					return appendChildren(node.childNodes);
				}
			}

			// inline code (<code>)
			case "code": {
				return ["`", appendChildren(node.childNodes), "`"];
			}

			case "blockquote": {
				return ["\n> ", toMFM(node.childNodes).split("\n").join("\n> ").trim()];
			}

			case "p":
			case "h4":
			case "h5":
			case "h6": {
				return ["\n\n", appendChildren(node.childNodes)];
			}

			// MFM does not currently support lists,
			// but this parser will parse html into a markdown style list with correct indentation.
			case "ul": {
				return [
					"\n  ",
					toMFM(node.childNodes, "ul").split("\n").join("\n  ").trim(),
				];
			}
			case "ol": {
				return [
					"\n  ",
					toMFM(node.childNodes, "ol").split("\n").join("\n  ").trim(),
				];
			}

			case "li": {
				if (background === "ol") {
					return [
						"\n",
						`${index}. `,
						toMFM(node.childNodes).split("\n").join("\n   ").trim(),
					];
				} else {
					return [
						"\n",
						"- ",
						toMFM(node.childNodes).split("\n").join("\n  ").trim(),
					];
				}
			}

			// other block elements
			case "div":
			case "header":
			case "footer":
			case "article":
			case "dt":
			case "dd": {
				return ["\n", appendChildren(node.childNodes)];
			}

			// temporary solution
			case "ruby": {
				const rtText = node.childNodes
					.filter((n) => n.nodeName === "rt")
					.map((n) => getText(n));
				const rubyText = node.childNodes
					.filter((n) => treeAdapter.isTextNode(n))
					.map((n) => getText(n));
				if (rubyText && rtText) {
					return [rubyText, "(", rtText, ")"];
				} else {
					return appendChildren(node.childNodes);
				}
			}

			default: {
				// includes inline elements
				return appendChildren(node.childNodes);
			}
		}

		return [];
	}
}
