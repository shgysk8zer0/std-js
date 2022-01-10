export async function fromResponse(resp, { algo = 'SHA-384' } = {}) {
	const buffer = await crypto.subtle.digest(algo.toUpperCase(), await resp.clone().arrayBuffer());
	const codeUnits = new Uint16Array(buffer);
	const charCodes = new Uint8Array(codeUnits.buffer);
	const hash = btoa([...charCodes].map(code => String.fromCharCode(code)).join(''));
	return `${algo.replace('-', '').toLowerCase()}-${hash}`;
}

export async function fromURL(url, {
	algo = 'SHA-384',
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
