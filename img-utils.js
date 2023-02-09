import { getDeferred } from './promises.js';
import { createElement } from './elements.js';

export const EXTENSIONS = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp',
};

const DEFAULT_TYPE = 'image/jpeg';
const DEFAULT_QUALITY = 0.8;
const DEFAULT_HEIGHT = 480;

export const supportsType = type => type.toLowerCase() in EXTENSIONS;
export const getExtensionForType = type => EXTENSIONS[type.toLowerCase()];

export async function resizeImageFile(file, {
	type    = DEFAULT_TYPE,
	quality = DEFAULT_QUALITY,
	height  = DEFAULT_HEIGHT,
	x = 0,
	y = 0,
} = {}) {
	const { resolve, reject, promise } = getDeferred();
	const img = await fileToImage(file);
	const { naturalWidth, naturalHeight } = img;
	const width = naturalWidth * (height / naturalHeight);

	if (typeof height !== 'number' || height < 1 || Number.isNaN(height)) {
		reject(new TypeError('Height must be a positive integer'));
	} else if (! supportsType(type)) {
		reject(new TypeError(`Unsupported type: ${type}`));
	} else if ('OffscreenCanvas' in globalThis) {
		const canvas = new globalThis.OffscreenCanvas(width, height);
		const ctx = canvas.getContext('2d');

		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(img, x, y, width, height);

		const blob = await canvas.convertToBlob({ type, quality });
		const basename = file.name.split('.')[0];
		const ext = getExtensionForType(blob.type);
		const f = new File([blob], `${basename}${ext}`, { type: blob.type });
		URL.revokeObjectURL(img.src);
		resolve(f);
	} else {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');

		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(img, x, y, width, height);

		const f = await canvasToFile(canvas, { type, quality, name: file.name });
		URL.revokeObjectURL(img.src);
		resolve(f);
	}

	return await promise;
}

export async function canvasToFile(canvas, {
	type    = DEFAULT_TYPE,
	quality = DEFAULT_QUALITY,
	name    = 'canvas-img',
} = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (! (canvas instanceof HTMLCanvasElement)) {
		reject(new DOMException('Expected a <canvas> element'));
	} else if (! supportsType(type)) {
		throw new TypeError(`Unsupported type: ${type}`);
	} else {
		canvas.toBlob(blob => {
			const basename = name.split('.')[0];
			const ext = getExtensionForType(blob.type);
			const file = new File([blob], `${basename}${ext}`, { type: blob.type });
			resolve(file);
		}, type, quality);
	}
	return promise;
}

export async function fileToImage(file, { width, height } = {}) {
	if (! (file instanceof File)) {
		throw new TypeError('Expected a file');
	} else if (! file.type.startsWith('image/')) {
		throw new TypeError('Expected an image file');
	} else {
		const img = new Image(width, height);
		img.src = URL.createObjectURL(file);
		await img.decode();
		return img;
	}
}

export async function fileToCanvas(file, { height = DEFAULT_HEIGHT, x = 0, y = 0 } = {}) {
	const img = await fileToImage(file);
	const { naturalWidth, naturalHeight } = img;
	const width = naturalWidth * (height / naturalHeight);
	const canvas = createElement('canvas', { width, height });
	const ctx = canvas.getContext('2d');

	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(img, x, y, width, height);
	canvas.dataset.blob = img.src;
	return canvas;
}
