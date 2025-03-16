import type { PageContent, PageVar } from "@/types/page";

export function collectPageVars(content: PageContent[]) {
	const pageVars: PageVar[] = [];
	const collect = (xs: PageContent[]) => {
		for (const x of xs) {
			if (x.type === "textInput") {
				pageVars.push({
					name: x.name,
					type: "string",
					value: x.default || "",
				});
			} else if (x.type === "textareaInput") {
				pageVars.push({
					name: x.name,
					type: "string",
					value: x.default || "",
				});
			} else if (x.type === "numberInput") {
				pageVars.push({
					name: x.name,
					type: "number",
					value: x.default || 0,
				});
			} else if (x.type === "switch") {
				pageVars.push({
					name: x.name,
					type: "boolean",
					value: x.default!,
				});
			} else if (x.type === "counter") {
				pageVars.push({
					name: x.name,
					type: "number",
					value: 0,
				});
			} else if (x.type === "radioButton") {
				pageVars.push({
					name: x.name,
					type: "string",
					value: x.default || "",
				});
			} else if (x.children) {
				collect(x.children);
			}
		}
	};
	collect(content);
	return pageVars;
}
