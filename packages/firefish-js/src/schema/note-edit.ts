export const packedNoteEdit = {
	type: "object",
	properties: {
		id: {
			type: "string",
			optional: false,
			nullable: false,
			format: "id",
			example: "xxxxxxxxxx",
		},
		updatedAt: {
			type: "string",
			optional: false,
			nullable: false,
			format: "date-time",
		},
		note: {
			type: "object",
			optional: true,
			nullable: false,
			ref: "Note",
		},
		noteId: {
			type: "string",
			optional: false,
			nullable: false,
			format: "id",
		},
		text: {
			type: "string",
			optional: true,
			nullable: true,
		},
		cw: {
			type: "string",
			optional: true,
			nullable: true,
		},
		fileIds: {
			type: "array",
			optional: true,
			nullable: false,
			items: {
				type: "string",
				format: "id",
			},
		},
		files: {
			type: "array",
			optional: true,
			nullable: false,
			items: {
				type: "object",
				optional: false,
				nullable: false,
				ref: "DriveFile",
			},
		},
		emojis: {
			type: "object",
			optional: true,
			nullable: true,
		},
	},
} as const;
