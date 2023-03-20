/**
 * @copyright 2021-2023 Chris Zuber <admin@kernvalley.us>
 */
export const SHA_1          = 'SHA-1';
export const SHA_256        = 'SHA-256';
export const SHA_384        = 'SHA-384';
export const SHA_512        = 'SHA-512';
export const SHA            = SHA_1; // Alias of SHA_1
export const HEX            = 'hex';
export const BASE_64        = 'base64';
export const ARRAY_BUFFER   = 'ArrayBuffer';
export const SRI            = 'sri';
const        DEFAULT_OUTPUT = HEX;

import { default  as md5Shim } from './md5.js';

export async function md5(str) {
	return md5Shim(str);
}

export function bufferToHex(buffer) {
	if (! (buffer instanceof ArrayBuffer)) {
		throw new TypeError('`bufferToHex()` requires an ArrayBuffer');
	} else {
		return [...new Uint8Array(buffer)].map(value =>  value.toString(16).padStart(2, '0')).join('');
	}
}

export function hexToBuffer(hex) {
	if (typeof hex !== 'string') {
		throw new TypeError('`hexToBuffer()` only accepts strings');
	} else if (hex.length === 0) {
		throw new TypeError('Empty string');
	} else if (hex.length % 2 !== 0) {
		throw new TypeError('Strings must be an even length');
	} else {
		return  new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))).buffer;
	}
}

export function sha1(data, { output = DEFAULT_OUTPUT } = {}) {
	return hash(data, { algorithm: SHA_1, output });
}

export function sha256(data, { output = DEFAULT_OUTPUT } = {}) {
	return hash(data, { algorithm: SHA_256, output });
}

export function sha384(data, { output = DEFAULT_OUTPUT } = {}) {
	return hash(data, { algorithm: SHA_384, output });
}

export function sha512(data, { output = DEFAULT_OUTPUT } = {}) {
	return hash(data, { algorithm: SHA_512, output });
}

export async function hash(data, { algorithm = SHA_256, output = DEFAULT_OUTPUT } = {}) {
	if (data instanceof File) {
		return hash(await data.arrayBuffer(), { algorithm, output });
	} else if (typeof data === 'string') {
		return hash(new TextEncoder().encode(data), { algorithm, output });
	} else if (typeof data === 'undefined') {
		throw new TypeError('Cannot hash `undefined`');
	} else if (data instanceof ArrayBuffer || data.buffer instanceof ArrayBuffer) {
		const buffer = await crypto.subtle.digest(algorithm.toUpperCase(), data);

		switch (output.toLowerCase()) {
			case HEX:
				return bufferToHex(buffer);

			case BASE_64:
				return btoa(buffer);

			case SRI: {
				const codeUnits = new Uint16Array(buffer);
				const charCodes = new Uint8Array(codeUnits.buffer);
				const result = btoa(String.fromCharCode(...charCodes));
				return `${algorithm.replace('-', '').toLowerCase()}-${result}`;
			}

			case ARRAY_BUFFER:
				return buffer;

			default:
				throw new TypeError(`Unsupported output format: '${output}'`);
		}
	}
}
