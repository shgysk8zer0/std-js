import { sleep, toGenerator } from './functions.js';
import { $ } from './esQuery.js';
/**
 * @deprecated [will be removed in v3.0.0]
 */
export function reportError(err) {
	console.warn('`reportError()` is deprecated and will be removed');
	if (err instanceof ErrorEvent) {
		const url = new URL('Errors/Client/', document.documentElement.dataset.endpoint || 'https://api.kernvalley.us');
		const data = new FormData();
		data.set('name', err.type);
		data.set('message', err.message);
		data.set('lineNumber', err.lineno);
		data.set('columnNumber', err.colno);
		data.set('fileName', err.filename);
		return navigator.sendBeacon(url, data);
	} else {
		return false;
	}
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function importsLoaded() {
	console.warn('`importsLoaded()` is deprecated and will be removed');
	await $('link[rel~="import"]:not([async])').map(async link => {
		if (link.import === null) {
			await new Promise((resolve, reject) => {
				link.addEventListener('load', () => resolve());
				link.addEventListener('error', reject);
			});
		}
	});
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function getImports() {
	console.warn('`getImports()` is deprecated and will be removed');
	await importsLoaded();
	const imports = await $('link[rel~="import"][name]').map(link => link.getAttribute('name'));
	return await Promise.all(imports.map(async name => ({ name, content: await importLink(name) })));
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function importLink(name) {
	console.warn('`importLink()` is deprecated and will be removed');
	await importsLoaded();
	const link = document.querySelector(`link[rel~="import"][name="${name}"]`);
	if (link instanceof HTMLLinkElement) {
		return new Promise((resolve, reject) => {
			link.addEventListener('error', reject);
			if (link.import === null) {
				link.addEventListener('load', () => resolve(link.import), { once: true });
			} else {
				resolve(link.import);
			}
		});
	} else {
		throw new Error(`Link named "${name}" has no content to import`);
	}
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export function selectElement(el) {
	console.warn('`selectElement()` is deprecated and will be removed');
	if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
		el.select();
	} else if (window.getSelection) {
		const selection = getSelection();
		const range = document.createRange();
		range.selectNodeContents(el);
		selection.removeAllRanges();
		selection.addRange(range);
	} else if (document.body.createTextRange) {
		const range = document.body.createTextRange();
		range.moveToElementText(el);
		range.select();
	} else {
		throw new Error('Text selection is not supported');
	}
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function imgur(url, {
	sizes = ['100vw'],
	alt = '',
	defaultSize = 'h',
} = {}) {
	console.warn('`imgur()` is deprecated and will be removed');
	const imgurSizes = {
		h: 1024,
		l: 640,
		m: 320,
		t: 160,
	};

	const formats = {
		'image/webp': '.webp',
		'image/png': '.png',
	};

	const picture = document.createElement('picture');
	const imgur = new URL(url, 'https://i.imgur.com/');
	const image = new Image();


	imgur.host = 'i.imgur.com';
	imgur.protocol = 'https:';
	imgur.pathname = imgur.pathname.replace(/\.[A-z]+$/, '');
	Object.entries(formats).forEach(format => {
		const [type, ext] = format;
		const source = document.createElement('source');
		source.type = type;
		source.sizes = sizes.join(', ');
		const srcset = Object.entries(imgurSizes).map(size => {
			const [suffix, width] = size;
			return `${imgur}${suffix}${ext} ${width}w`;
		});
		source.srcset = srcset.join(', ');
		picture.append(source);
	});

	return new Promise((resolve, reject) => {
		picture.append(image);
		image.alt = alt;
		image.addEventListener('load', (event) => resolve(event.target.parentElement), { once: true });
		image.addEventListener('error', event => reject(event.target));
		image.src = `${imgur}${defaultSize}.png`;
	});
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export function query(selector, node = document) {
	console.warn('`query()` is deprecated and will be removed');
	let results = Array.from(node.querySelectorAll(selector));
	if (node.matches(selector)) {
		results.unshift(node);
	}
	return results;
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export function isOnline() {
	console.warn('`isOnline()` is deprecated and will be removed');
	return navigator.onLine === true;
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function notify(title, {
	body = '',
	icon = '',
	dir = document.dir,
	lang = document.documentElement.lang,
	tag = '',
	data = null,
	vibrate = false,
	renotify = false,
	requireInteraction = false,
	actions = [],
	silent = false,
	noscreen = false,
	sticky = false,
} = {}) {
	console.warn('`notify()` is deprecated and will be removed');
	return new Promise(async (resolve, reject) => {
		try {
			if (!(window.Notification instanceof Function)) {
				throw new Error('Notifications not supported');
			} else if (Notification.permission === 'denied') {
				throw new Error('Notification permission denied');
			} else if (Notification.permission === 'default') {
				await new Promise(async (resolve, reject) => {
					const resp = await Notification.requestPermission();

					if (resp === 'granted') {
						resolve();
					} else {
						reject(new Error('Notification permission not granted'));
					}
				});
			}

			if (('serviceWorker' in navigator) && navigator.serviceWorker.controller !== null) {
				const reg = await navigator.serviceWorker.getRegistration();
				await reg.showNotification(title, {
					body,
					icon,
					dir,
					lang,
					tag,
					actions,
					data,
					vibrate,
					renotify,
					requireInteraction,
					silent,
					noscreen,
					sticky,
				});
				const notifications = await reg.getNotifications();
				resolve(notifications[notifications.length - 1]);
			} else {
				const notification = new Notification(title, {
					body,
					icon,
					dir,
					lang,
					tag,
					data,
					vibrate,
					renotify,
					requireInteraction,
					actions,
					silent,
					noscreen,
					sticky,
				});

				notification.addEventListener('show', event => resolve(event.target), { once: true });
				notification.addEventListener('error', event => reject(event.target), { once: true });
			}

		} catch (err) {
			reject(err);
		}
	});
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export function isInternalLink(link) {
	console.warn('`isInternalLink()` is deprecated and will be removed');
	return link.origin === location.origin;
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function parseResponse(resp) {
	console.warn('`parseResponse()` is deprecated and will be removed');
	if (! resp.headers.has('Content-Type')) {
		throw new Error(`No Content-Type header in request to "${resp.url}"`);
	} else if (resp.headers.get('Content-Length') === 0) {
		throw new Error(`No response body for "${resp.url}"`);
	}

	const type = resp.headers.get('Content-Type');

	if (type.startsWith('application/json')) {
		return resp.json();
	} else if (type.startsWith('application/xml')) {
		return new DOMParser().parseFromString(await resp.text(), 'application/xml');
	} else if (type.startsWith('image/svg+xml')) {
		return new DOMParser().parseFromString(await resp.text(), 'image/svg+xml');
	} else if (type.startsWith('text/html')) {
		return new DOMParser().parseFromString(await resp.text(), 'text/html');
	} else if (type.startsWith('text/plain')) {
		return resp.text();
	} else {
		throw new TypeError(`Unsupported Content-Type: ${type}`);
	}
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function registerServiceWorker(path) {
	console.warn('`registerServiceWorker()` is deprecated and will be removed');
	return new Promise(async (resolve, reject) => {
		try {
			if (!Navigator.prototype.hasOwnProperty('serviceWorker')) {
				throw new Error('Service worker not supported');
			} else if (!navigator.onLine) {
				throw new Error('Offline');
			}

			const url = new URL(path, document.baseURI);
			const reg = await navigator.serviceWorker.register(url, { scope: document.baseURI });

			if (navigator.onLine) {
				reg.update();
			}

			reg.addEventListener('updatefound', event => resolve(event.target));
			reg.addEventListener('install', event => resolve(event.target));
			reg.addEventListener('activate', event => resolve(event.target));
			reg.addEventListener('error', event => reject(event.target));
			reg.addEventListener('fetch', console.info);
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function marquee({
	parent,
	delay = 200,
	cursor = '|',
	blinkRate = 800,
	pause = 1000,
	containerTag = 'span',
	cursorTag = 'span',
} = {}, ...sentences) {
	console.warn('`marquee()` is deprecated and will be removed');
	const cursorEl = document.createElement(cursorTag);
	const container = document.createElement(containerTag);

	if (Element.prototype.animate) {
		cursorEl.animate([
			{ opacity: 0 },
			{ opacity: 1 }
		], {
			duration: blinkRate,
			iterations: Infinity,
			direction: 'alternate',
		});
	}

	cursorEl.textContent = cursor;
	parent.prepend(container, cursorEl);

	for (const text of toGenerator(...sentences)) {
		container.textContent = '';

		for (const char of text.split('')) {
			container.append(char);
			await sleep(delay);
		}

		await sleep(pause);

		while (container.textContent !== '') {
			const chars = container.textContent.split('');
			chars.pop();
			container.textContent = chars.join('');
			await sleep(delay);
		}
	}
}
