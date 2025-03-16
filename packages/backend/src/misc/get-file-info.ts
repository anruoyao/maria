import * as fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import * as crypto from "node:crypto";
import * as stream from "node:stream/promises";
import { fileTypeFromFile } from "file-type";
import probeImageSize from "probe-image-size";
import isSvg from "is-svg";
import sharp from "sharp";
import { encode } from "blurhash";

type FileInfo = {
	size: number;
	md5: string;
	mime: string;
	fileExtension: string | null;
	width?: number;
	height?: number;
	orientation?: number;
	blurhash?: string;
};

const TYPE_OCTET_STREAM = {
	mime: "application/octet-stream",
	ext: null,
};

const TYPE_SVG = {
	mime: "image/svg+xml",
	ext: "svg",
};

/**
 * Get file information
 */
export async function getFileInfo(path: string): Promise<FileInfo> {
	const size = await getFileSize(path);
	const md5 = await calcHash(path);

	let type = await detectType(path);

	// image dimensions
	let width: number | undefined;
	let height: number | undefined;
	let orientation: number | undefined;

	if (
		[
			"image/jpeg",
			"image/gif",
			"image/png",
			"image/apng",
			"image/webp",
			"image/bmp",
			"image/tiff",
			"image/svg+xml",
			"image/vnd.adobe.photoshop",
			"image/avif",
		].includes(type.mime)
	) {
		const imageSize = await detectImageSize(path).catch((_) => {
			return undefined;
		});

		// うまく判定できない画像は octet-stream にする
		if (!imageSize) {
			type = TYPE_OCTET_STREAM;
		} else if (imageSize.wUnits === "px") {
			width = imageSize.width;
			height = imageSize.height;
			orientation = imageSize.orientation;

			// 制限を超えている画像は octet-stream にする
			if (imageSize.width > 16383 || imageSize.height > 16383) {
				type = TYPE_OCTET_STREAM;
			}
		}
	}

	let blurhash: string | undefined;

	if (
		[
			"image/jpeg",
			"image/gif",
			"image/png",
			"image/apng",
			"image/webp",
			"image/svg+xml",
			"image/avif",
		].includes(type.mime)
	) {
		blurhash = await getBlurhash(path).catch((_) => {
			return undefined;
		});
	}

	return {
		size,
		md5,
		mime: type.mime,
		fileExtension: type.ext,
		width,
		height,
		orientation,
		blurhash,
	};
}

/**
 * Detect MIME Type and extension
 */
export async function detectType(path: string): Promise<{
	mime: string;
	ext: string | null;
}> {
	// Check 0 byte
	const fileSize = await getFileSize(path);
	if (fileSize === 0) {
		return TYPE_OCTET_STREAM;
	}

	const type = await fileTypeFromFile(path);

	if (type) {
		// XMLはSVGかもしれない
		if (type.mime === "application/xml" && (await checkSvg(path))) {
			return TYPE_SVG;
		}

		return {
			mime: type.mime,
			ext: type.ext,
		};
	}

	// 種類が不明でもSVGかもしれない
	if (await checkSvg(path)) {
		return TYPE_SVG;
	}

	// それでも種類が不明なら application/octet-stream にする
	return TYPE_OCTET_STREAM;
}

/**
 * Check the file is SVG or not
 */
export async function checkSvg(path: string) {
	try {
		const size = await getFileSize(path);
		if (size > 1 * 1024 * 1024) return false;
		return isSvg(await fs.readFile(path, "utf-8"));
	} catch {
		return false;
	}
}

/**
 * Get file size
 */
export async function getFileSize(path: string): Promise<number> {
	return (await fs.stat(path)).size;
}

/**
 * Calculate MD5 hash
 */
async function calcHash(path: string): Promise<string> {
	const hash = crypto.createHash("md5").setEncoding("hex");
	await stream.pipeline(createReadStream(path), hash);
	return hash.read();
}

/**
 * Detect dimensions of image
 */
async function detectImageSize(path: string): Promise<{
	width: number;
	height: number;
	wUnits: string;
	hUnits: string;
	orientation?: number;
}> {
	const readable = createReadStream(path);
	const imageSize = await probeImageSize(readable);
	readable.destroy();
	return imageSize;
}

/**
 * Calculate average color of image
 */
function getBlurhash(path: string): Promise<string> {
	return new Promise((resolve, reject) => {
		sharp(path)
			.raw()
			.ensureAlpha()
			.resize(64, 64, { fit: "inside" })
			.toBuffer((err, buffer, { width, height }) => {
				if (err) return reject(err);

				let hash: string;

				try {
					hash = encode(new Uint8ClampedArray(buffer), width, height, 7, 7);
				} catch (e) {
					return reject(e);
				}

				resolve(hash);
			});
	});
}
