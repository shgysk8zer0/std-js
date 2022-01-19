export const SHA_1 = 'SHA-1';
export const SHA_256 = 'SHA-256';
export const SHA_384 = 'SHA-384';
export const SHA_512 = 'SHA-512';
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

export function sha1(data) {
	return hash(data, SHA_1);
}

export function sha256(data) {
	return hash(data, SHA_256);
}

export function sha384(data) {
	return hash(data, SHA_384);
}

export function sha512(data) {
	return hash(data, SHA_512);
}

export async function hash(data, algo = SHA_256) {
	if (data instanceof ArrayBuffer) {
		const buffer = await crypto.subtle.digest(algo.toUpperCase(), data);

		return bufferToHex(buffer);
	} else if (data instanceof File) {
		return hash(await data.arrayBuffer(), algo);
	} else if (typeof data === 'string') {
		return hash(new TextEncoder().encode(data), algo);
	}
}
