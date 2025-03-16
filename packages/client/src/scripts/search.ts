import { i18n } from "@/i18n";
import { api, popup, promiseDialog } from "@/os";
import { mainRouter } from "@/router";
import MkPostSearch from "@/components/MkPostSearch.vue";

export async function search() {
	const { canceled, result } = await new Promise<
		| { canceled: true; result: undefined }
		| {
				canceled: false;
				result: {
					action: "lookup";
					query: string;
				};
		  }
		| {
				canceled: false;
				result: {
					action: "search";
					query?: string;
					from?: string;
					range?: string;
					withFiles: boolean;
					searchCwAndAlt: boolean;
				};
		  }
	>((resolve, _) => {
		popup(
			MkPostSearch,
			{},
			{
				done: (result) => {
					resolve(result ?? { canceled: true });
				},
			},
			"closed",
		);
	});

	if (canceled || result == null || result.query === "") return;

	if (result.action === "lookup") {
		if (result.query.startsWith("#")) {
			mainRouter.push(`/tags/${encodeURIComponent(result.query.slice(1))}`);
			return;
		}
		if (result.query.startsWith("@")) {
			mainRouter.push(`/${result.query}`);
			return;
		}
		if (result.query.startsWith("https://")) {
			const promise = api("ap/show", {
				uri: result.query,
			});

			promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);
			const res = await promise;

			if (res.type === "User") {
				mainRouter.push(`/@${res.object.username}@${res.object.host}`);
			} else if (res.type === "Note") {
				mainRouter.push(`/notes/${res.object.id}`);
			}

			return;
		}

		// fallback
		mainRouter.push(`/search?q=${encodeURIComponent(result.query)}`);
	}

	if (result.action === "search") {
		const params = new URLSearchParams();

		if (result.query != null) {
			params.append("q", result.query);
		}

		if (result.from != null) {
			if (result.from === "me" || result.from.includes("@"))
				params.append("user", result.from);
			else params.append("host", result.from);
		}

		if (result.range != null) {
			const split = result.range.split("-");
			if (split.length === 1) {
				params.append("since", result.range);
				params.append("until", result.range);
			} else {
				if (split[0] !== "") params.append("since", split[0]);
				if (split[1] !== "") params.append("until", split[1]);
			}
		}

		params.append("detailed", result.searchCwAndAlt ? "1" : "0");
		params.append("withFiles", result.withFiles ? "1" : "0");

		mainRouter.push(`/search?${params.toString()}`);
	}
}
