import { $ } from './esQuery.js';
import { attr, css, data, toggleClass, on, off, ready, loaded, when, parseHTML } from './dom.js';
import { getCustomElement, createCustomElement, registerCustomElement, defined } from './custom-elements.js';
import { sleep } from './promises.js';
import { get as getLocation } from './geo.js';

export function openWindow(url, {
	name = '',
	referrer = false,
	opener = false,
	height = null,
	width = null,
	x = null,
	y = null,
	resizable = true,
	location = false,
	scrollbars = true,
} = {}) {
	let flags = [];

	if (opener === false) {
		flags.push('noopener');
	}

	if (referrer === false) {
		flags.push('noreferrer');
	}

	// Some properties only apply to sized windows
	if (Number.isInteger(width) || Number.isInteger(height)) {
		if (Number.isInteger(height)) {
			flags.push(`height=${height}`);
		}

		if (Number.isInteger(width)) {
			flags.push(`width=${width}`);
		}

		if (Number.isInteger(x)) {
			flags.push(`left=${x}`);
		}

		if (Number.isInteger(y)) {
			flags.push(`top=${y}`);
		}

		if (resizable) {
			flags.push('resiabled');
		}

		if (location) {
			flags.push('location');
		}

		if (scrollbars) {
			flags.push('scrollbars');
		}
	}

	return window.open(url, name, flags.join(','));
}

export async function statusDialog(what, { duration = 5000, type = 'info', heading = null } = {}) {
	const dialog = document.createElement('dialog');
	const container = document.createElement('div');

	if (typeof heading === 'string') {
		const header = document.createElement('h3');
		header.classList.add('center');
		header.textContent = heading;
		dialog.append(header);
	} else if (heading instanceof Element) {
		dialog.append(heading);
	}

	if (typeof type === 'string') {
		dialog.classList.add('status-box', type);
	}

	switch(typeof what) {
		case 'string':
		case 'number':
			container.textContent = what;
			dialog.addEventListener('click', () => dialog.close());
			dialog.classList.add('cursor-pointer');
			break;

		case 'object':
			if (what instanceof URL) {
				const a = document.createElement('a');
				a.textContent = what.href;
				a.href = what.href;
				a.relList.add('noopener', 'noreferrer');
				a.addEventListener('click', () => dialog.close());
				container.append(a);
			} else if (Array.isArray(what)) {
				container.textContent = what.join(', ');
				dialog.addEventListener('click', () => dialog.close());
				dialog.classList.add('cursor-pointer');
			} else if (what instanceof Error) {
				container.textContent = what.message;
				dialog.addEventListener('click', () => dialog.close());
				dialog.classList.add('cursor-pointer');
			} else if (what instanceof HTMLTemplateElement) {
				container.append(what.content.cloneNode(true));
			} else if (what instanceof DocumentFragment || what instanceof Element) {
				container.append(what);
			} else if (what instanceof NodeList) {
				container.append(...what);
			} else {
				const pre = document.createElement('pre');
				const code = document.createElement('code');
				code.textContent = JSON.stringify(what, null, 4);
				pre.append(code);
				container.append(pre);
			}
			break;

		default:
			throw new TypeError(`Unsupported type: ${typeof what}`);
	}

	await new Promise(resolve => {
		dialog.addEventListener('close', ({ target }) => {
			target.remove();
			resolve();
		});

		dialog.append(container);
		document.body.append(dialog);
		dialog.showModal();

		if (Number.isFinite(duration)) {
			setTimeout(() => dialog.close(), duration);
		}
	});
}

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

export async function whenOnline() {
	if (navigator.onLine === false) {
		await when(window, 'online');
	}
}

export async function whenOffline() {
	if (navigator.onLine === true) {
		await when(window, 'offline');
	}
}

export async function whenVisible() {
	if (document.visibilityState === 'hidden') {
		await when(document, 'visibilitychange');
	}
}

export async function whenHidden() {
	if (document.visibilityState === 'visible') {
		await when(document, 'visibilitychange');
	}
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function wait(ms) {
	console.warn('`wait()` is deprecated. Please use `sleep()` instead.');
	await sleep(ms);
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export async function waitUntil(target, event) {
	console.warn('waitUntil() is deprecated and will be removed. Please use when() instead');
	await when(target, event);
}

export async function pageVisible() {
	if (document.visibilityState !== 'visible') {
		await when(document, 'visibilitychange');
	}
}

export async function pageHidden() {
	if (document.visibilityState !== 'hidden') {
		await when(document, 'visibilitychange');
	}
}

export function isModule() {
	// Cannot check `import.meta` due to syntax errors, so check `currentScript`
	return ! (document.currentScript instanceof HTMLScriptElement);
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

export { $, attr, css, data, toggleClass, on, off, when, ready, loaded, parseHTML,
	getCustomElement, createCustomElement, registerCustomElement, defined, sleep,
	getLocation,
 };

export { mediaQuery, prefersReducedMotion, prefersColorScheme, displayMode } from './media-queries.js';
export { createSVG, useSVG } from './svg.js';
