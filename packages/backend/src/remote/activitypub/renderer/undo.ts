import { config } from "@/config.js";

export const renderUndo = (object: any, userId: string) => {
	if (object == null) return null;
	const id =
		typeof object.id === "string" && object.id.startsWith(config.url)
			? `${object.id}/undo`
			: undefined;

	return {
		type: "Undo",
		...(id ? { id } : {}),
		actor: `${config.url}/users/${userId}`,
		object,
		published: new Date().toISOString(),
	};
};
