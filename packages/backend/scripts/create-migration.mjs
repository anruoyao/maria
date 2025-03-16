import { execa } from "execa";

(async () => {
	await execa(
		"pnpm",
		["typeorm", "migration:create", `src/migration/${process.argv[2]}`],
		{
			stdio: "inherit",
		},
	);
})();
