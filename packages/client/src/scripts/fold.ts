import type { entities } from "firefish-js";
import { isDeleted, isRenote } from "./note";
import type {
	FoldableNotification,
	NotificationFolded,
} from "@/types/notification";
import type { NoteFolded, NoteThread, NoteType } from "@/types/note";
import { me } from "@/me";

interface FoldOption {
	/** If items length is 1, skip aggregation */
	/** @default true */
	skipSingleElement?: boolean;
}

/**
 * Fold similar content
 * @param ns items to fold
 * @param fetch_limit fetch limit of pagination. items will be divided into subarrays with this limit as the length.
 * @param classfier Classify the given item into a certain category (return a string representing the category)
 * @param aggregator Aggregate items of the given class into itemfolded
 * @returns folded items
 */
export function foldItems<ItemFolded, Item>(
	ns: Item[],
	classfier: (n: Item, index: number) => string,
	aggregator: (ns: Item[], key: string) => ItemFolded,
	_options?: FoldOption,
) {
	let res: (ItemFolded | Item)[] = [];

	const options: FoldOption = _options ?? {};
	options.skipSingleElement ??= true;

	const toAppendKeys: string[] = [];
	const foldMap = new Map<string, Item[]>();

	for (const [index, n] of ns.entries()) {
		const key = classfier(n, index);
		const arr = foldMap.get(key);
		if (arr != null) {
			arr.push(n);
		} else {
			foldMap.set(key, [n]);
			toAppendKeys.push(key);
		}
	}

	res = toAppendKeys.map((key) => {
		const arr = foldMap.get(key)!;
		if (arr?.length === 1 && options?.skipSingleElement) {
			return arr[0];
		}
		return aggregator(arr, key);
	});

	return res;
}

export function foldNotifications(ns: entities.Notification[]) {
	// By the implement of MkPagination, lastId is unique and is safe for key
	const lastId = ns[ns.length - 1]?.id ?? "prepend";
	return foldItems(
		ns,
		(n) => {
			switch (n.type) {
				case "renote":
					return `renote-${n.note.renote.id}`;
				case "reaction":
					return `reaction-${n.reaction}-of-${n.note.id}`;
				case "pollVote":
					return `pollVote-${n.note.id}`;
				default: {
					return `${n.id}`;
				}
			}
		},
		(ns, key) => {
			const represent = ns[0];
			function check(
				ns: entities.Notification[],
			): ns is FoldableNotification[] {
				return (
					represent.type === "renote" ||
					represent.type === "reaction" ||
					represent.type === "pollVote"
				);
			}
			if (!check(ns)) {
				return represent;
			}
			return {
				...represent,
				folded: true,
				userIds: ns.map((nn) => nn.userId),
				users: ns.map((nn) => nn.user),
				notifications: ns!,
				id: `G-${lastId}-${key}`,
			} as NotificationFolded;
		},
	);
}

export function foldNotes(ns: NoteType[], foldReply = true, foldRenote = true) {
	// By the implement of MkPagination, lastId is unique and is safe for key
	const lastId = ns[ns.length - 1]?.id ?? "prepend";

	function foldReplies(ns: NoteType[]) {
		const res: Array<NoteType | NoteThread> = [];
		const threads = new Map<NoteType["id"], NoteType[]>();

		for (const n of [...ns].reverse()) {
			if (isDeleted(n.id)) {
				continue;
			}
			if (n.replyId && threads.has(n.replyId)) {
				const th = threads.get(n.replyId)!;
				threads.delete(n.replyId);
				th.push(n);
				threads.set(n.id, th);
			} else if (n.reply?.replyId && threads.has(n.reply.replyId)) {
				const th = threads.get(n.reply.replyId)!;
				threads.delete(n.reply.replyId);
				th.push(n.reply, n);
				threads.set(n.id, th);
			} else {
				threads.set(n.id, [n]);
			}
		}

		for (const n of ns) {
			const conversation = threads.get(n.id);
			if (conversation == null) continue;

			const first = conversation[0];
			const last = conversation[conversation.length - 1];
			if (conversation.length === 1) {
				res.push(first);
				continue;
			}

			res.push({
				// The same note can only appear once in the timeline, so the ID will not be repeated
				id: first.id,
				createdAt: last.createdAt,
				folded: "thread",
				note: last,
				parents: (first.reply ? [first.reply] : []).concat(
					conversation.slice(0, -1),
				),
			});
		}

		return res;
	}

	let res: (NoteType | NoteThread | NoteFolded)[] = ns;

	if (foldReply) {
		res = foldReplies(ns);
	}

	if (foldRenote) {
		res = foldItems(
			res,
			(n) => {
				// never fold my renotes
				if (!("folded" in n) && isRenote(n) && n.userId !== me?.id)
					return `renote-${n.renoteId}`;
				return n.id;
			},
			(ns, key) => {
				const represent = ns[0];
				if (!key.startsWith("renote-")) {
					return represent;
				}
				return {
					id: `G-${lastId}-${key}`,
					key: `G-${lastId}-${key}`,
					createdAt: represent.createdAt,
					folded: "renote",
					note: (represent as entities.Note).renote!,
					renotesArr: ns as entities.Note[],
				};
			},
			{
				skipSingleElement: false,
			},
		);
	}

	return res;
}
