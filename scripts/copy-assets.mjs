import fs from "node:fs/promises";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRootDir = join(path.dirname(fileURLToPath(import.meta.url)), "../");
const file = (relativePath) => join(repositoryRootDir, relativePath);

await (async () => {
	await fs.rm(file("built/_client_dist_/locales"), { recursive: true, force: true });
	await Promise.all([
		fs.cp(file("packages/backend/src/server/web"), file("packages/backend/built/server/web"), { recursive: true }),
		fs.cp(file("custom/assets"), file("packages/backend/assets"), { recursive: true }),
		fs.cp(file("packages/backend/src/server/file/assets"), file("packages/backend/built/server/file/assets"), { recursive: true }),
		fs.mkdir(file("built/_client_dist_/locales"), { recursive: true }),
	]);

	const locales = (await import("../locales/index.mjs")).default;
	const { version } = JSON.parse(await fs.readFile(file("package.json")));

	for await (const [lang, locale] of Object.entries(locales)) {
		await fs.writeFile(
			file(`built/_client_dist_/locales/${lang}.${version}.json`),
			JSON.stringify({ ...locale, _version_: version }),
			"utf-8",
		);
	}

	const jsAssets = [
		file("packages/backend/built/server/web/boot.js"),
		file("packages/backend/built/server/web/bios.js"),
		file("packages/backend/built/server/web/cli.js"),
	];

	for await (const jsFile of jsAssets) {
		const content = (await fs.readFile(jsFile, "utf-8"))
			.replace("SUPPORTED_LANGS", JSON.stringify(Object.keys(locales)));
		await fs.writeFile(jsFile, content, "utf-8");
	}

	// TODO?: minify packages/backend/built/server/web/*.css
})();
