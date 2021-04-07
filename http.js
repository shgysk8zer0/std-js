import { parseHTML } from './dom.js';
import { signalAborted, abortTimeoutController, supported } from './abort.js';
import { features as eventFeatures } from './events.js';

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

export async function fetch(url, opts) {
	if (opts.signal instanceof AbortSignal && eventFeatures.nativeSignal === false) {
		return await Promise.race([window.fetch(url), signalAborted(opts.signal)]);
	} else {
		return await window.fetch(url, opts);
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

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = abortTimeoutController(timeout).signal;
	} else if (signal instanceof AbortController) {
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

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = abortTimeoutController(timeout).signal;
	} else if (signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'POST', body, mode, credentials, referrerPolicy, headers,
		cache, redirect, integrity, keepalive, signal });
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

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = abortTimeoutController(timeout).signal;
	} else if (signal instanceof AbortController) {
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
	const resp = await getLink('link[rel="manifest"][href]', { timeout, signal } = {});
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
