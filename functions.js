import esQuery from './esQuery.js';

export function between(min, val, max) {
	return val >= min && val <= max;
}

export function css(what, props = {}, { base = document, priority = undefined } = {}) {
	if (what instanceof Element) {
		Object.entries(props).forEach(([p, v]) => {
			if (typeof v === 'string' || typeof v === 'number') {
				what.style.setProperty(p, v, priority);
			} else {
				what.style.removeProperty(p);
			}
		});
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => css(el, props, { base, priority }));
	} else if (typeof what === 'string') {
		css(base.querySelectorAll(what), props, { base, priority });
	}
}

export function data(what, props = {}, { base = document } = {}) {
	if (what instanceof Element) {
		Object.entries(props).forEach(([p, v]) => {
			if (v instanceof Date) {
				v = v.toISOString();
			} else if (v instanceof URL) {
				v = v.href;
			}

			switch (typeof v) {
				case 'string':
				case 'number':
					what.dataset[p] = v;
					break;

				case 'boolean':
					if (v) {
						what.dataset[p] = '';
					} else {
						delete what.dataset[p];
					}
					break;

				case 'undefined':
					delete what.dataset[p];
					break;

				default:
					if (v === null) {
						delete what.dataset[p];
					} else {
						what.dataset[p] = JSON.stringify(v);
					}
			}
		});
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => data(el, props, { base }));
	} else if (typeof what === 'string') {
		data(base.querySelectorAll(what), props);
	}
}

export function attr(what, props = {}, { base = document } = {}) {
	if (what instanceof Element) {
		Object.entries(props).forEach(([p, v]) => {
			if (typeof v === 'string' || typeof v === 'number') {
				what.setAttribute(p, v);
			} else if (typeof v === 'boolean') {
				what.toggleAttribute(p, v);
			} else if (v instanceof Date) {
				what.setAttribute(p, v.toISOString());
			} else if (v instanceof URL) {
				what.setAttribute(p, v.href);
			} else if (typeof v === 'undefined' || v === null) {
				what.removeAttribute(p);
			} else {
				what.setAttribute(p, JSON.stringify(v));
			}
		});
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => attr(el, props, { base }));
	} else if (typeof what === 'string') {
		attr(base.querySelectorAll(what), props);
	}
}

export function toggleClass(what, classes, { base = document, force = undefined } = {}) {
	if (what instanceof Element) {
		if (typeof classes === 'string') {
			what.classList.toggle(classes, force);
		} else if (Array.isArray(classes)) {
			classes.forEach(cn => toggleClass(what, cn, { force }));
		} else {
			Object.entries(classes).forEach(([cl, cond]) => {
				if (cond instanceof Function) {
					what.classList.toggle(cl, cond.apply(what, [cl]));
				} else {
					what.classList.toggle(cl, cond);
				}
			});
		}
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => toggleClass(el, classes, { force }));
	} else if (typeof what === 'string') {
		toggleClass(base.querySelectorAll(what), classes, { force });
	}
}

export function on(what, when, ...args) {
	if (what instanceof Element) {
		if (typeof when === 'string') {
			what.addEventListener(when, ...args);
		} else if (Array.isArray(when)) {
			when.forEach(e => on(what, e, ...args));
		} else {
			Object.entries(when).forEach(([ev, cb]) => on(what, ev, cb, ...args));
		}
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => on(el, when, ...args));
	} else if (typeof what === 'string') {
		on(document.querySelectorAll(what), when, ...args);
	}
}

export function off(what, when, ...args) {
	if (what instanceof Element) {
		if (typeof when === 'string') {
			what.removeEventListener(when, ...args);
		} else if (Array.isArray(when)) {
			when.forEach(e => off(what, e, ...args));
		} else {
			Object.entries(when).forEach(([ev, cb]) => off(what, ev, cb, ...args));
		}
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => off(el, when, ...args));
	} else if (typeof what === 'string') {
		off(document.querySelectorAll(what), when, ...args);
	}
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

export function createSVG({ fill = null, height = null, width = null } = {}) {
	const xmlns = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(xmlns, 'svg');

	if (typeof height === 'number') {
		svg.setAttribute('height', height);
	}

	if (typeof width === 'number') {
		svg.setAttribute('width', width);
	}

	if (typeof fill === 'string') {
		svg.setAttribute('fill', fill);
	}

	return svg;
}

export function useSVG(sprite, { src = '/img/icons.svg', fill = null, height = null, width = null } = {}) {
	const url = new URL(src, document.baseURI);
	const xmlns = 'http://www.w3.org/2000/svg';
	const xlink = 'http://www.w3.org/1999/xlink';
	const svg = createSVG({ fill, height, width });
	const use = document.createElementNS(xmlns, 'use');

	url.hash = `#${sprite}`;
	use.setAttributeNS(xlink, 'xlink:href', url.href);
	svg.append(use);

	return svg;
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
	return mediaQuery({ 'prefers-reduced-motion': 'reduce' });
}

export function prefersColorScheme() {
	return mediaQuery({ 'prefers-color-scheme': 'dark' }) ? 'dark': 'light';
}

export function displayMode() {
	const displays = ['browser', 'standalone', 'minimal-ui', 'fullscreen'];
	return displays.find(mode => mediaQuery({ 'display-mode': mode })) || 'browser';
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

function $(selector, parent = document) {
	return new esQuery(selector, parent);
}

export async function sleep(ms, ...args) {
	await new Promise(resolve => setTimeout(() => resolve(...args), ms));
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function wait(ms) {
	console.warn('`wait()` is deprecated. Please use `sleep()` instead.');
	await sleep(ms);
}

export async function ready(...requires) {
	if (document.readyState === 'loading') {
		await waitUntil(document, 'DOMContentLoaded');
	}

	await defined(...requires);
}

export async function defined(...els) {
	await Promise.all(els.map(el => customElements.whenDefined(el)));
}

export async function loaded(...requires) {
	if (document.readyState !== 'complete') {
		await waitUntil(window, 'load');
	}

	await defined(...requires);
}

export async function waitUntil(target, event) {
	await new Promise(resolve => target.addEventListener(event, resolve, { once: true }));
}

export async function pageVisible() {
	if (document.visibilityState !== 'visible') {
		await waitUntil(document, 'visibilitychange');
	}
}

export async function pageHidden() {
	if (document.visibilityState !== 'hidden') {
		await waitUntil(document, 'visibilitychange');
	}
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

export async function read(...nodes) {
	if (! window.hasOwnProperty('speechSynthesis')) {
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

export async function getNotificationPermission() {
	if (Notification.permission === 'default') {
		return createCustomElement('html-notification', 'Allow Notifications?', {
			body: 'This site would like permission to show notifications',
			lang: 'en',
			dir: 'ltr',
			tag: 'notification-request',
			requireInteraction: true,
			vibrate: [],
			actions: [{
				title: 'Allow',
				action: 'request',
			}, {
				title: 'Deny',
				action: 'deny',
			}]
		}).then(notification => {
			return new Promise(resolve => {
				notification.addEventListener('notificationclick', ({ action, target }) => {
					switch(action) {
						case 'request':
							resolve(Notification.requestPermission());
							target.close();
							break;

						case 'deny':
							resolve('denied');
							target.close();
							break;
					}
				});
				notification.addEventListener('close', () => resolve('denied'));
			});
		});
	} else {
		return Notification.permission;
	}
}

export async function notificationsAllowed() {
	return getNotificationPermission().then(perm => perm === 'granted');
}

export async function getLocation({ maximumAge, timeout, enableHighAccuracy = false } = {}) {
	/* https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition */
	return new Promise((resolve, reject) => {
		if (! ('geolocation' in navigator)) {
			reject('Your browser does not support GeoLocation');
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge, timeout, enableHighAccuracy });
	});
}

$.mediaQuery = esQuery.mediaQuery;
$.getLocation = esQuery.getLocation;
$.loaded = esQuery.loaded;
$.ready = esQuery.ready;
export { $ };
