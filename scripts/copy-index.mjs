// To mitigate this issue https://github.com/napi-rs/napi-rs/issues/1768

// Adding index.js/index.d.ts to the repository is recommended by
// napi-rs maintainer: https://github.com/napi-rs/napi-rs/issues/1807#issuecomment-1814510181

import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

(async () => {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	fs.copyFileSync(
		join(__dirname, "/../packages/backend-rs/index.js"),
		join(__dirname, "/../packages/backend-rs/built/index.js"),
	);
})();
