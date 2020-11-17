import esQuery from './esQuery.js';

export function between(min, val, max) {
	return val >= min && val <= max;
}

export function clone(thing) {
	if (thing instanceof Array) {
		return [...thing].map(clone);
	} else if (['string', 'number'].includes(typeof (thing))) {
		return thing;
	} else if (thing instanceof Element) {
		return thing.cloneNode(true);
	} else if (thing instanceof Function) {
		return thing;
	} else {
		return Object.assign({}, thing);
	}
}

export function changeTagName(target, tag = 'div', { replace = true, is = null } = {}) {
	if (typeof target === 'string') {
		target = document.querySelector(target);
	}

	let el;

	if (tag.includes('-')) {
		const ElementClass = customElements.get(tag);
		el = new ElementClass();
	} else {
		el = document.createElement(tag, { is });
	}

	Array.from(target.attributes).forEach(({ name, value }) => el.setAttribute(name, value));

	if (replace === true) {
		el.append(...target.children);

		if (target.isConnected) {
			target.replaceWith(el);
		}
	} else {
		[...target.children].forEach(child => el.append(child.cloneNode(true)));
	}

	return el;
}

export function mediaQuery(query = {}) {
	if (typeof matchMedia !== 'function') {
		return false;
	} else {
		const queries = Object.entries(query).map(([k, v]) => `(${k}: ${v})`).join(' and ');
		return matchMedia(queries).matches;
	}
}

export function prefersReducedMotion() {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersColorScheme() {
	return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark' : 'light';
}

export function displayMode() {
	const displays = ['browser', 'standalone', 'minimal-ui', 'fullscreen'];
	return typeof matchMedia === 'function'
		? displays.find(mode => matchMedia(`(display-mode: ${mode})`).matches)
		: 'browser';
}

export function isInViewport(el) {
	if (typeof el === 'string') {
		return isInViewport(document.querySelector(el));
	} else if (el instanceof Element) {
		const { top, bottom, left, right } = el.getBoundingClientRect();
		const { height, width } = screen;

		return (between(0, top, height) || between(0, bottom, height))
			&& (between(0, left, width) || between(0, right, width));
	} else {
		throw new Error('Not a valid element or selector');
	}
}

export function registerCustomElement(tag, cls, ...rest) {
	if (! (window.customElements instanceof Object)) {
		console.error(new Error('`customElements` not supported'));
		return false;
	} else if (typeof customElements.get(tag) !== 'undefined') {
		console.warn(new Error(`<${tag}> is already defined`));
		// Returns true/false if element being registered matches given class
		return customElements.get(tag) === cls;
	} else {
		customElements.define(tag, cls, ...rest);
		return true;
	}
}

export async function getCustomElement(tag) {
	if (! (window.customElements instanceof Object)) {
		throw(new Error('`customElements` not supported'));
	} else {
		await customElements.whenDefined(tag);
		return await customElements.get(tag);
	}
}

export async function createCustomElement(tag, ...args) {
	const Pro = await getCustomElement(tag);
	return new Pro(...args);
}

export function parseHTML(text, type = 'text/html') {
	const parser = new DOMParser();
	const doc = parser.parseFromString(text, type);
	const frag = document.createDocumentFragment();
	[...doc.body.childNodes].forEach(el => frag.append(el));
	return frag;
}

/**
 * Control the execution rate of callbacks, i.e. for listeners
 * https://davidwalsh.name/function-debounce
 *
 * @param  Callable callback    The callback
 * @param  int      [ms]        Number of milliseconds, defaulting to 1/60th a second
 * @param  bool     [immediate] Trigger function immediately instead of after wait ms
 * @return function             Rate limited function
 */
export function debounce(func, wait = 17, immediate = false) {
	let timeout;

	return function(...args) {
		const later = () => {
			timeout = null;

			if (! immediate) {
				func.apply(this, args);
			}
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);

		if (immediate && ! timeout) {
			func.apply(this, args);
		}
	};
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export function reportError(err) {
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

export function $(selector, parent = document) {
	return new esQuery(selector, parent);
}

export async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

export async function ready(...requires) {
	if (document.readyState === 'loading') {
		await waitUntil(document, 'DOMContentLoaded');
	}
	await defined(...requires);
	await importsLoaded();
}

export async function defined(...els) {
	if (els.length !== 0) {
		await Promise.all(els.map(el => customElements.whenDefined(el)));
	}
}

export async function loaded(...requires) {
	if (document.readyState !== 'complete') {
		await waitUntil(window, 'load');
	}
	await importsLoaded();
	await defined(...requires);
}


/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function importsLoaded() {
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
	await importsLoaded();
	const imports = await $('link[rel~="import"][name]').map(link => link.getAttribute('name'));
	return await Promise.all(imports.map(async name => {
		return {
			name,
			content: await importLink(name),
		};
	}));
}


/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function importLink(name) {
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

export async function waitUntil(target, event) {
	const prom = new Promise(resolve => {
		target.addEventListener(event, () => resolve(), { once: true });
	});
	await prom;
}

export async function pageVisible() {
	await new Promise(resolve => {
		if (document.visibilityState === 'visible') {
			resolve();
		} else {
			const handler = () => {
				if (document.visibilityState === 'visible') {
					document.removeEventListener('visibilitychange', handler);
					resolve();
				}
			};
			document.addEventListener('visibilitychange', handler);
		}
	});
}

export async function pageHidden() {
	await new Promise(resolve => {
		if (document.visibilityState === 'hidden') {
			resolve();
		} else {
			const handler = () => {
				if (document.visibilityState === 'hidden') {
					document.removeEventListener('visibilitychange', handler);
					resolve();
				}
			};
			document.addEventListener('visibilitychange', handler);
		}
	});
}

export function* toGenerator(...items) {
	/*eslint no-constant-condition: "off" */
	while (true) {
		for (const item of items) {
			yield item;
		}
	}
}

export function setIncrementor(obj, {
	key = 'i',
	start = 0,
	increment = 1,
} = {}) {
	const inc = (function* (n = 0) {
		/* eslint no-constant-condition: "off" */
		while (true) {
			yield n;
			n += increment;
		}
	})(obj.hasOwnProperty(key) ? obj[key] : start);

	return Object.defineProperty(obj, key, {
		get: () => inc.next().value,
		enumerable: true,
	});
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export function selectElement(el) {
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

export async function read(...nodes) {
	if (!window.hasOwnProperty('speechSynthesis')) {
		throw new Error('SpeechSynthesis not supported');
	}

	for (const node of nodes) {
		if (typeof (node) === 'string') {
			/*
			 * Work-around for Chrome issue with long utterances
			 * <https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak#Browser_compatibility>
			*/
			for (const chunk of chunkText(node, 200)) {
				await new Promise((resolve, reject) => {
					const utter = new SpeechSynthesisUtterance(chunk);
					utter.addEventListener('end', resolve);
					utter.addEventListener('error', reject);
					speechSynthesis.speak(utter);
				});
			}
		} else if (node instanceof Text) {
			node.parentElement.classList.add('reading');
			await read(node.wholeText);
			node.parentElement.classList.remove('reading');
		} else if (node instanceof Element && !node.hidden && node.hasChildNodes()) {
			await read(...node.childNodes);
		}
	}
}

export function chunkText(string, length) {
	const size = Math.ceil(string.length / length);
	const chunks = Array(size);

	for (let i = 0, offset = 0; i < size; i++ , offset++) {
		chunks[i] = string.substr(offset, length);
	}
	return chunks;
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export function query(selector, node = document) {
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
	return link.origin === location.origin;
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function parseResponse(resp) {
	if (!resp.headers.has('Content-Type')) {
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

export async function getLocation(options = {}) {
	/* https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition */
	return new Promise((resolve, reject) => {
		if (!('geolocation' in navigator)) {
			reject('Your browser does not support GeoLocation');
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, options);
	});
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function registerServiceWorker(path) {
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
			await wait(delay);
		}

		await wait(pause);

		while (container.textContent !== '') {
			const chars = container.textContent.split('');
			chars.pop();
			container.textContent = chars.join('');
			await wait(delay);
		}
	}
}
