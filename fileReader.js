import { getDeferred } from './promises.js';
import { parse } from './dom.js';
/**
 * @SEE: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 */
async function readFile(file, as = 'text', { signal, progress, encoding = 'UTF-8' } = {}) {
	if (! (file instanceof File)) {
		throw new TypeError('Not a File');
	}

	const { resolve, reject, promise } = getDeferred();
	const reader = new FileReader();

	if (progress instanceof Function) {
		reader.addEventListener('progress', progress, { signal });
	}

	reader.addEventListener('load', ({ target: { result }}) => resolve(result));
	reader.addEventListener('error', ({ target: { error }}) => reject(error));
	reader.addEventListener('abort', ({ target: { error }}) => reject(error));

	switch (as) {
		case 'text':
		reader.readAsText(file, encoding);
		break;

		case 'data':
		reader.readAsDataURL(file);
		break;

		case 'binary':
		reader.readAsBinaryString(file);
		break;

		case 'buffer':
		reader.readAsArrayBuffer(file);
		break;

		default:
		throw new TypeError(`Unsupported file read type: ${as}`);
	}

	if (signal instanceof AbortSignal) {
		if (signal.aborted) {
			reader.abort();
		} else {
			signal.addEventListener('abort', () => reader.abort(), { once: true });
		}
	}

	return promise;
}

export async function text(file, { signal, progress, encoding = 'UTF-8' } = {}) {
	return readFile(file, 'text', { signal, progress, encoding });
}

export async function json(file, { signal, progress, encoding = 'UTF-8' } = {}) {
	const json = await text(file, { signal, progress, encoding });
	return JSON.parse(json);
}

export async function document(file, { signal, progress, encoding = 'UTF-8', mimeType: type = 'text/html' } = {}) {
	const body = await text(file, { signal, progress, encoding });
	return parse(body, { type });
}

export async function html(file, { signal, progress, encoding = 'UTF-8', fragment: asFrag = true } = {}) {
	const html = await text(file, { signal, progress, encoding });
	return parse(html, { asFrag,  type: 'text/html' });
}

export async function xml(file, { signal, progress, encoding = 'UTF-8' } = {}) {
	return document(file, { signal, progress, encoding, mimeType: 'application/xml' });
}

export async function xhtml(file, { signal, progress, encoding = 'UTF-8' } = {}) {
	return document(file, { signal, progress, encoding, mimeType: 'application/xhtml+xml' });
}

export async function svg(file, { signal, progress, encoding = 'UTF-8' } = {}) {
	return document(file, { signal, progress, encoding, mimeType: 'image/svg+xml' });
}

export async function data(file, { signal, progress } = {}) {
	return readFile(file, 'data', { signal, progress });
}

export async function binary(file, { signal, progress } = {}) {
	return readFile(file, 'binary', { signal, progress });
}

export async function buffer(file, { signal, progress } = {}) {
	return readFile(file, 'buffer', { signal, progress });
}

export async function image(file, { signal, progress, height, width, alt = '' } = {}) {
	const img = new Image(width, height);
	img.alt = alt;
	img.src = await data(file, { signal, progress });
	await img.decode();
	return img;
}
