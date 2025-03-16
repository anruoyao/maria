// To mitigate this issue https://github.com/napi-rs/napi-rs/issues/1768

// During development, the contents of index.js/index.d.ts may change,
// so this script only copies these files when this bug occurs

import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

(async () => {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));

	if (!fs.existsSync(join(__dirname, "/../packages/backend-rs/built/index.js"))) {
		fs.copyFileSync(
			join(__dirname, "/../packages/backend-rs/index.js"),
			join(__dirname, "/../packages/backend-rs/built/index.js"),
		);
		console.warn("backend-rs/built/index.js has not been updated (https://github.com/napi-rs/napi-rs/issues/1768)");
	}
	if (!fs.existsSync(join(__dirname, "/../packages/backend-rs/built/index.d.ts"))) {
		fs.copyFileSync(
			join(__dirname, "/../packages/backend-rs/index.d.ts"),
			join(__dirname, "/../packages/backend-rs/built/index.d.ts"),
		);
		console.warn("backend-rs/built/index.d.ts has not been updated (https://github.com/napi-rs/napi-rs/issues/1768)");
	}
})();
