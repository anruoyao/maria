import {
	type Instance,
	MAX_LENGTH_INSTANCE,
} from "@/models/entities/instance.js";
import { Instances } from "@/models/index.js";
import { genId, toPuny } from "backend-rs";
import { Cache } from "@/misc/cache.js";
import Logger from "@/services/logger.js";

const logger = new Logger("register-or-fetch-instance");
const cache = new Cache<Instance>("registerOrFetchInstanceDoc", 60 * 60);

export async function registerOrFetchInstanceDoc(
	host: string,
): Promise<Instance> {
	const _host = toPuny(host);

	if (_host.length > MAX_LENGTH_INSTANCE.host) {
		logger.error(
			`Instance host name must not be longer than ${MAX_LENGTH_INSTANCE.host} characters`,
		);
		logger.error(`hostname: ${_host}`);
		throw new Error("Instance host name is too long");
	}

	const cached = await cache.get(_host);
	if (cached) return cached;

	const index = await Instances.findOneBy({ host: _host });

	if (index == null) {
		const i = await Instances.insert({
			id: genId(),
			host: _host,
			caughtAt: new Date(),
			lastCommunicatedAt: new Date(),
		}).then((x) => Instances.findOneByOrFail(x.identifiers[0]));

		await cache.set(_host, i);
		return i;
	} else {
		await cache.set(_host, index);
		return index;
	}
}
