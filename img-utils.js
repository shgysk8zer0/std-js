import { getDeferred } from './promises.js';
import { createImage, createElement } from './elements.js';

export async function canvasToFile(canvas, { type = 'image/jpeg', quality = 0.8, name } = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (! (canvas instanceof HTMLCanvasElement)) {
		reject(new DOMException('Expected a <canvas> element'));
	} else {
		canvas.toBlob(blob => {
			const file = new File([blob], name, { type: blob.type });
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
		const img = createImage(URL.createObjectURL(file), {
			width, height,
		});
		await img.decode();
		return img;
	}
}

export async function fileToCanvas(file, { height, x = 0, y = 0 } = {}) {
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
