import { parse } from './dom.js';
import { signalAborted, abortTimeoutController } from './abort.js';
import { features as eventFeatures } from './events.js';

export function setURLParams(url, params) {
	if (! (url instanceof URL)) {
		url = new URL(url, document.baseURI);
	}

	if (params instanceof HTMLFormElement) {
		return setURLParams(url, new FormData(params));
	} else if (params instanceof FormData) {
		return setURLParams(url, Object.fromEntries(params));
	} else if (params instanceof URLSearchParams) {
		return setURLParams(url, Object.fromEntries(params));
	} else if (Array.isArray(params) || typeof params === 'string') {
		return setURLParams(url, new URLSearchParams(params));
	} else if (typeof params === 'object') {
		url.search = new URLSearchParams({ ...Object.fromEntries(url.searchParams), ...params});
	}

	return url;
}

function filename(src) {
	if (typeof src === 'string') {
		return new URL(src, location.origin).pathname.split('/').at(-1);
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

export async function fetch(url, opts) {
	if (opts.signal instanceof AbortSignal && eventFeatures.nativeSignal === false) {
		return await Promise.race([globalThis.fetch(url), signalAborted(opts.signal)]);
	} else {
		return await globalThis.fetch(url, opts);
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
	if (typeof body !== 'undefined') {
		url = setURLParams(url, body);
	} else if (typeof url === 'string') {
		url = new URL(url, document.baseURI);
	}

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = abortTimeoutController(timeout).signal;
	} else if (signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'GET', mode, credentials, referrerPolicy,
		headers, cache, redirect, integrity, keepalive, signal });
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

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = abortTimeoutController(timeout).signal;
	} else if (signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'POST', body, mode, credentials, referrerPolicy,
		headers, cache, redirect, integrity, keepalive, signal });
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
	if (typeof body !== 'undefined') {
		url = setURLParams(url, body);
	} else if (typeof url === 'string') {
		url = new URL(url, document.baseURI);
	}

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = abortTimeoutController(timeout).signal;
	} else if (signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'DELETE', mode, credentials, referrerPolicy,
		headers, cache, redirect, integrity, keepalive, signal });
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
	sanitizer = undefined,
} = {}) {
	const html = await getText(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	return parse(html, { head, asFrag, sanitizer });
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

export async function submitForm(form) {
	if (typeof form === 'string') {
		return await submitForm(document.forms[form]);
	} else if (form instanceof Event) {
		form.preventDefault();
		return await submitForm(form.target);
	} else if (form instanceof HTMLFormElement) {
		switch (form.method.toLowerCase()) {
			case 'get':
				return GET(form.action, { body: new FormData(form) });

			case 'post':
				return POST(form.action, { body: new FormData(form) });

			case 'delete':
				return DELETE(form.action, { body: new FormData(form) });

			default:
				throw new Error(`Unsupported method: ${form.method}`);
		}
	}
}

export async function getManifest({ timeout, signal } = {}) {
	const resp = await getLink('link[rel="manifest"][href]', { timeout, signal });
	return await resp.json();
}

export async function getLink(link, { timeout, signal } = {}) {
	if (typeof link === 'string') {
		return await getLink(document.querySelector(link, { timeout, signal }));
	} else if (! (link instanceof HTMLLinkElement)) {
		throw new DOMException('Expected a <link>');
	} else if (link.href.length === 0) {
		throw new DOMException('Missing `href` on <link>');
	} else {
		const { href, integrity, type, referrerPolicy, crossOrigin } = link;

		let credentials;
		const mode = typeof crossOrigin === 'string' ? 'cors' : 'no-cors';
		const headers = new Headers();

		if (mode === 'cors') {
			credentials = crossOrigin === 'use-credentials' ? 'include' : 'omit';
		}

		if (typeof type === 'string') {
			headers.set('Accept', type);
		}

		return await GET(href, { mode, credentials, headers, integrity, referrerPolicy, timeout, signal });
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
	sanitizer = undefined,
} = {}) {
	const html = await postText(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal, timeout });

	return parse(html, { head, asFrag, sanitizer });
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

export function postNav(url, data = {}, { target = '_self' , enctype = 'application/x-www-form-urlencoded' } = {}) {
	const form = document.createElement('form');
	const inputs = Object.entries(data).map(([name, value]) => {
		const input = document.createElement('input');
		input.name = name;
		input.type = 'hidden';
		input.readOnly = true;
		input.value = value;
		return input;
	});

	form.action = url;
	form.method = 'POST';
	form.target = target;
	form.enctype = enctype;
	form.hidden = true;
	form.append(...inputs);
	form.addEventListener('submit', ({ target }) => setTimeout(() => target.remove), 100);

	requestAnimationFrame(() => {
		document.body.append(form);
		form.submit();
	});
}
