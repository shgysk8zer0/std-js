import { SHA_256, SHA_384, SHA_512, SRI, hash } from './hash.js';

export const DEFAULT_ALGORITHM = SHA_384;
export const ALGORITHMS = [SHA_256, SHA_384, SHA_512];

export async function fromArrayBuffer(data, { algorithm = DEFAULT_ALGORITHM } = {}) {
	return hash(data, { algorithm, output: SRI });
}

export async function fromFile(file, { algorithm = DEFAULT_ALGORITHM } = {}) {
	if (file instanceof File) {
		return fromArrayBuffer(await file.arrayBuffer(), { algorithm });
	} else {
		throw new TypeError('Not a file');
	}
}

export async function fromResponse(resp, { algorithm = DEFAULT_ALGORITHM } = {}) {
	if (! (resp instanceof Response)) {
		throw new TypeError('Not a response');
	} else if (resp.bodyUsed) {
		throw new DOMException('Response body is already used');
	} else {
		return fromArrayBuffer(await resp.clone().arrayBuffer(), { algorithm });
	}
}

export async function fromURL(url, {
	algorithm = DEFAULT_ALGORITHM,
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
		return fromResponse(resp, { algorithm });
	} else {
		throw new DOMException(`<${resp.url || url}> [${resp.status} ${resp.statusText}]`);
	}
}
