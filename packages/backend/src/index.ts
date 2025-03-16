/**
 * Firefish Entry Point
 */

import { EventEmitter } from "node:events";
import { inspect } from "node:util";
import boot from "./boot/index.js";

Error.stackTraceLimit = Number.POSITIVE_INFINITY;
EventEmitter.defaultMaxListeners = 128;

boot().catch((err) => {
	console.error(inspect(err));
});
