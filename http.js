import { parseHTML } from './functions.js';

function filename(src) {
	if (typeof src === 'string') {
		const path = src.split('/');
		return path[path.length - 1];
	} else {
		return '';
	}
}

function getType({ headers }) {
	if (headers instanceof Headers && headers.has('Content-Type')) {
		return headers.get('Content-Type').split(';')[0];
	} else {
		return null;
	}
}

export async function GET(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers(),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
} = {}) {
	if (typeof url === 'string') {
		url = new URL(url, document.baseURI);
	}

	if (typeof body !== 'undefined') {
		url.search = body instanceof HTMLFormElement
			? new URLSearchParams(new FormData(body))
			: new URLSearchParams(body);
	}

	if (typeof signal === 'undefined' && typeof timeout === 'number') {
		signal = getAbortController(timeout).signal;
	} else if ('AbortController' in window && signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'GET', mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal });
}

export async function POST(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers(),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
} = {}) {
	if (typeof body === 'object' && ! (body instanceof FormData)) {
		if (body instanceof HTMLFormElement) {
			body = new FormData(body);
		} else if (body instanceof File) {
			let file;
			[body, file] = [new FormData(), body];
			// @TODO figure out a default param name for the file
			// @TODO handle multiple files and arrays containing files
			body.set(file.name, file, file.name);
		} else {
			body = JSON.stringify(body);

			if (headers instanceof Headers && ! headers.has('Content-Type')) {
				headers.set('Content-Type', 'application/json');
			}
		}
	}

	if (typeof signal === 'undefined' && typeof timeout === 'number') {
		signal = getAbortController(timeout).signal;
	} else if ('AbortController' in window && signal instanceof AbortController) {
		signal = signal.signal;
	}

	const resp = await fetch(url, { method: 'POST', body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal });

	if (resp.ok) {
		return resp;
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}

export async function DELETE(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers(),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
} = {}) {
	if (typeof url === 'string') {
		url = new URL(url, document.baseURI);
	}

	if (typeof body !== 'undefined') {
		url.search = body instanceof HTMLFormElement
			? new URLSearchParams(new FormData(body))
			: new URLSearchParams(body);
	}

	if (typeof signal === 'undefined' && typeof timeout === 'number') {
		signal = getAbortController(timeout).signal;
	} else if ('AbortController' in window && signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'DELETE', mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal });
}

export async function getHTML(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: 'text/html' }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	head = true,
	asFrag = true,
} = {}) {
	const html = await getText(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	return parseHTML(html, { head, asFrag });
}

export async function getText(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: 'text/plain' }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
} = {}) {
	const resp = await GET(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	return await resp.text();
}

export async function getJSON(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: 'application/json' }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
} = {}) {
	const resp = await GET(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	return await resp.json();
}

export async function getFile(url, {
	name = null,
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers(),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
} = {}) {
	if (typeof name !== 'string') {
		name = filename(url);
	}

	const resp = await GET(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	if (resp.ok) {
		const type = getType(resp);
		return new File([await resp.blob()], name, { type });
	} else {
		throw new Error(`Error fetching ${name}`);
	}
}

export async function postHTML(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: 'text/html' }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	head = true,
	asFrag = true,
} = {}) {
	const html = await postText(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	return parseHTML(html, { head, asFrag });
}

export async function postJSON(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: 'application/json' }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
} = {}) {
	const resp = await POST(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	return await resp.json();
}

export async function postText(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: 'text/plain' }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
} = {}) {
	const resp = await POST(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	return await resp.text();
}

export function getAbortController(ms) {
	if ('AbortController' in window) {
		const controller = new AbortController();

		if (Number.isInteger(ms)) {
			setTimeout(() => controller.abort(), ms);
		}

		return controller;
	} else {
		return { signal: undefined, abort: function() {}};
	}
}
