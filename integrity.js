const SHA_256 = 'SHA-256';
const SHA_384 = 'SHA-384';
const SHA_512 = 'SHA-512';

export const DEFAULT_ALGO = SHA_384;
export const ALGOS = [SHA_256, SHA_384, SHA_512];

export async function fromArrayBuffer(data, { algo = DEFAULT_ALGO } = {}) {
	const buffer = await crypto.subtle.digest(algo.toUpperCase(), data);
	const codeUnits = new Uint16Array(buffer);
	const charCodes = new Uint8Array(codeUnits.buffer);
	const hash = btoa([...charCodes].map(code => String.fromCharCode(code)).join(''));
	return `${algo.replace('-', '').toLowerCase()}-${hash}`;
}

export async function fromFile(file, { algo = DEFAULT_ALGO } = {}) {
	if (file instanceof File) {
		return fromArrayBuffer(await file.arrayBuffer(), { algo });
	} else {
		throw new TypeError('Not a file');
	}
}

export async function fromResponse(resp, { algo = DEFAULT_ALGO } = {}) {
	if (! (resp instanceof Response)) {
		throw new TypeError('Not a response');
	} else if (resp.bodyUsed) {
		throw new DOMException('Response body is already used');
	} else {
		return fromArrayBuffer(await resp.clone().arrayBuffer(), { algo });
	}
}

export async function fromURL(url, {
	algo = DEFAULT_ALGO,
	cache = 'no-store',
	credentials = 'omit',
	headers = new Headers(),
	keepalive = undefined,
	mode = 'cors',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	signal,
} = {}) {
	const resp = await fetch(url, { cache, credentials, headers, keepalive, mode, redirect, referrerPolicy, signal });

	if (resp.ok) {
		return fromResponse(resp, { algo });
	} else {
		throw new DOMException(`<${resp.url || url}> [${resp.status} ${resp.statusText}]`);
	}
}
