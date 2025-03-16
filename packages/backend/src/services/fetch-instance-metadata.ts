import { URL } from "node:url";
import { type DOMWindow, JSDOM } from "jsdom";
import fetch from "node-fetch";
import tinycolor from "tinycolor2";
import { getJson, getHtml, getAgentByUrl } from "@/misc/fetch.js";
import {
	type Instance,
	MAX_LENGTH_INSTANCE,
} from "@/models/entities/instance.js";
import { Instances } from "@/models/index.js";
import { getFetchInstanceMetadataLock } from "@/misc/app-lock.js";
import Logger from "@/services/logger.js";
import { type Nodeinfo, fetchNodeinfo, isSafeUrl } from "backend-rs";
import { inspect } from "node:util";

const logger = new Logger("metadata", "cyan");

export async function fetchInstanceMetadata(
	instance: Instance,
	force = false,
): Promise<void> {
	const lock = await getFetchInstanceMetadataLock(instance.host);

	if (!force) {
		const _instance = await Instances.findOneBy({ host: instance.host });
		const now = Date.now();
		if (
			_instance?.infoUpdatedAt &&
			now - _instance.infoUpdatedAt.getTime() < 1000 * 60 * 60 * 24
		) {
			await lock.release();
			return;
		}
	}

	logger.info(`Fetching metadata of ${instance.host} ...`);

	try {
		const [info, dom, manifest] = await Promise.all([
			fetchNodeinfo(instance.host).catch(() => null),
			fetchDom(instance).catch(() => null),
			fetchManifest(instance).catch(() => null),
		]);

		const [favicon, icon, themeColor, name, description] = await Promise.all([
			fetchFaviconUrl(instance, dom).catch(() => null),
			fetchIconUrl(instance, dom, manifest).catch(() => null),
			getThemeColor(info, dom, manifest).catch(() => null),
			getSiteName(info, dom, manifest).catch(() => null),
			getDescription(info, dom, manifest).catch(() => null),
		]);

		logger.info(`Successfuly fetched metadata of ${instance.host}`);

		const updates = {
			infoUpdatedAt: new Date(),
		} as Record<string, any>;

		if (info) {
			updates.softwareName =
				info.software.name
					.toLowerCase()
					.substring(0, MAX_LENGTH_INSTANCE.softwareName) || null;
			updates.softwareVersion =
				info.software.version.substring(
					0,
					MAX_LENGTH_INSTANCE.softwareVersion,
				) || null;
			updates.openRegistrations = info.openRegistrations;
			updates.maintainerName = info.metadata.maintainer
				? info.metadata.maintainer.name?.substring(
						0,
						MAX_LENGTH_INSTANCE.maintainerName,
					) || null
				: null;
			updates.maintainerEmail = info.metadata.maintainer
				? info.metadata.maintainer.email?.substring(
						0,
						MAX_LENGTH_INSTANCE.maintainerEmail,
					) || null
				: null;
		}

		if (name) updates.name = name.substring(0, MAX_LENGTH_INSTANCE.name);
		if (description)
			updates.description = description.substring(
				0,
				MAX_LENGTH_INSTANCE.description,
			);
		if (icon || favicon)
			updates.iconUrl = (icon || favicon)?.substring(
				0,
				MAX_LENGTH_INSTANCE.iconUrl,
			);
		if (favicon)
			updates.faviconUrl = favicon.substring(0, MAX_LENGTH_INSTANCE.faviconUrl);
		if (themeColor)
			updates.themeColor = themeColor.substring(
				0,
				MAX_LENGTH_INSTANCE.themeColor,
			);

		await Instances.update(instance.id, updates);

		logger.info(`Successfuly updated metadata of ${instance.host}`);
	} catch (e) {
		logger.error(
			`Failed to update metadata of ${instance.host}:\n${inspect(e)}`,
		);
	} finally {
		await lock.release();
	}
}

async function fetchDom(instance: Instance): Promise<DOMWindow["document"]> {
	logger.info(`Fetching HTML of ${instance.host} ...`);

	const html = await getHtml(`https://${instance.host}`);
	const { window } = new JSDOM(html);

	return window.document;
}

async function fetchManifest(
	instance: Instance,
): Promise<Record<string, unknown> | null> {
	const url = `https://${instance.host}`;

	const manifestUrl = `${url}/manifest.json`;

	const manifest = (await getJson(manifestUrl)) as Record<string, unknown>;

	return manifest;
}

async function fetchFaviconUrl(
	instance: Instance,
	doc: DOMWindow["document"] | null,
): Promise<string | null> {
	const url = `https://${instance.host}`;

	if (doc) {
		// https://github.com/misskey-dev/misskey/pull/8220#issuecomment-1025104043
		const href = Array.from(doc.getElementsByTagName("link"))
			.reverse()
			.find((link) => link.relList.contains("icon"))?.href;

		if (href) {
			return new URL(href, url).href;
		}
	}

	const faviconUrl = `${url}/favicon.ico`;

	if (!isSafeUrl(faviconUrl)) {
		return null;
	}

	const favicon = await fetch(faviconUrl, {
		// TODO
		//timeout: 10000,
		agent: getAgentByUrl,
		size: 1024 * 1024,
	});

	if (favicon.ok) {
		return faviconUrl;
	}

	return null;
}

async function fetchIconUrl(
	instance: Instance,
	doc: DOMWindow["document"] | null,
	manifest: Record<string, any> | null,
): Promise<string | null> {
	if (manifest?.icons && manifest.icons.length > 0 && manifest.icons[0].src) {
		const url = `https://${instance.host}`;
		return new URL(manifest.icons[0].src, url).href;
	}

	if (doc) {
		const url = `https://${instance.host}`;

		// https://github.com/misskey-dev/misskey/pull/8220#issuecomment-1025104043
		const links = Array.from(doc.getElementsByTagName("link")).reverse();
		// https://github.com/misskey-dev/misskey/pull/8220/files/0ec4eba22a914e31b86874f12448f88b3e58dd5a#r796487559
		const href = [
			links.find((link) =>
				link.relList.contains("apple-touch-icon-precomposed"),
			)?.href,
			links.find((link) => link.relList.contains("apple-touch-icon"))?.href,
			links.find((link) => link.relList.contains("icon"))?.href,
		].find((href) => href);

		if (href) {
			return new URL(href, url).href;
		}
	}

	return null;
}

async function getThemeColor(
	info: Nodeinfo | null,
	doc: Window["document"] | null,
	manifest: Record<string, any> | null,
): Promise<string | null> {
	const themeColor =
		info?.metadata?.themeColor ||
		doc?.querySelector('meta[name="theme-color"]')?.getAttribute("content") ||
		manifest?.theme_color;

	if (themeColor) {
		const color = new tinycolor(themeColor);
		if (color.isValid()) return color.toHexString();
	}

	return null;
}

async function getSiteName(
	info: Nodeinfo | null,
	doc: DOMWindow["document"] | null,
	manifest: Record<string, any> | null,
): Promise<string | null> {
	if (info?.metadata) {
		if (info.metadata.nodeName || info.metadata.name) {
			return info.metadata.nodeName || info.metadata.name;
		}
	}

	if (doc) {
		const og = doc
			.querySelector('meta[property="og:title"]')
			?.getAttribute("content");

		if (og) {
			return og;
		}
	}

	if (manifest) {
		return manifest.name || manifest.short_name;
	}

	return null;
}

async function getDescription(
	info: Nodeinfo | null,
	doc: DOMWindow["document"] | null,
	manifest: Record<string, any> | null,
): Promise<string | null> {
	if (info?.metadata) {
		if (info.metadata.nodeDescription || info.metadata.description) {
			return info.metadata.nodeDescription || info.metadata.description;
		}
	}

	if (doc) {
		const meta = doc
			.querySelector('meta[name="description"]')
			?.getAttribute("content");
		if (meta) {
			return meta;
		}

		const og = doc
			.querySelector('meta[property="og:description"]')
			?.getAttribute("content");
		if (og) {
			return og;
		}
	}

	if (manifest) {
		return manifest.name || manifest.short_name;
	}

	return null;
}
