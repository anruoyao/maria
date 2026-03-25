import type { entities } from "firefish-js";

/**
 * 投稿を表す文字列を取得します。
 * @param {*} note (packされた)投稿
 */
export const getNoteSummary = (note: entities.Note): string => {
	/*
	if (note.deletedAt) {
		return `(${i18n.ts.deletedNote})`;
	}
	*/

	let summary = "";

	// 本文
	if (note.cw != null) {
		summary += note.cw;
	} else {
		summary += note.text ? note.text : "";
	}

	// ファイルが添付されているとき
	if ((note.files || []).length !== 0) {
		const len = note.files?.length;
		summary += ` 📎${len !== 1 ? ` (${len})` : ""}`;
	}

	// 投票が添付されているとき
	if (note.poll) {
		summary += " 📊";
	}

	/*

	// 返信のとき
	if (note.replyId) {
		if (note.reply) {
			summary += `\n\nRE: ${getNoteSummary(note.reply)}`;
		} else {
			summary += '\n\nRE: ...';
		}
	}

	// Renoteのとき
	if (note.renoteId) {
		if (note.renote) {
			summary += `\n\nRN: ${getNoteSummary(note.renote)}`;
		} else {
			summary += '\n\nRN: ...';
		}
	}

	*/

	return summary.trim();
};
