export const packedNoteFileSchema = {
	type: "object",
	properties: {
		serialNo: {
			type: "number",
			optional: false,
			nullable: false,
		},
		noteId: {
			type: "string",
			optional: false,
			nullable: false,
			format: "id",
			example: "xxxxxxxxxx",
		},
		fileId: {
			type: "string",
			optional: false,
			nullable: false,
			format: "id",
			example: "xxxxxxxxxx",
		},
	},
} as const;
