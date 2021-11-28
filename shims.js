import CookieStore from  './CookieStore.js';
import { uuidv4 } from './uuid.js';

if (typeof globalThis === 'undefined') {
	/* global global: true */
	if (typeof self !== 'undefined') {
		self.globalThis = self;
	} else if (typeof window !== 'undefined') {
		window.globalThis = window;
	} else if (typeof global !== 'undefined') {
		global.globalThis = global;
	}
}

if (! globalThis.hasOwnProperty('AggregateError')) {
	window.AggregateError = class AggregateError extends Error {
		constructor(errors, message) {
			if (typeof message === 'undefined') {
				super(errors);
				this.errors = [];
			} else {
				super(message);
				this.errors = errors;
			}
		}
	};
}

if (! (globalThis.reportError instanceof Function)) {
	globalThis.reportError = function reportError(error) {
		const { message, name, fileName: filename, lineNumber: lineno, columnNumber: colno } = error;
		globalThis.dispatchEvent(new ErrorEvent('error', { error, message: `${name}: ${message}`, filename, lineno, colno }));
	};
}

if (! ('cookieStore' in globalThis)) {
	globalThis.cookieStore = new CookieStore();
}

if (! (Math.clamp instanceof Function)) {
	Math.clamp = function(value, min, max) {
		return Math.min(Math.max(value, min), max);
	};
}

/*
 * Question of if it will be `Math.clamp` or `Math.constrain`
 */
if (! (Math.constrain instanceof Function)) {
	Math.constrain = Math.clamp;
}

if ('Promise' in globalThis && ! (Promise.prototype.finally instanceof Function)) {
	Promise.prototype.finally = function(callback) {
		return this.then(async val => {
			await callback();
			return val;
		}, async val => {
			await callback();
			return val;
		});
	};
}

if ('Promise' in globalThis && ! (Promise.allSettled instanceof Function)) {
	Promise.allSettled = function(promises) {
		return Promise.all(Array.from(promises).map(function(call) {
			return new Promise(function(resolve) {
				if (! (call instanceof Promise)) {
					call = Promise.resolve(call);
				}
				call.then(function(value) {
					resolve({ status: 'fulfilled', value: value });
				}).catch(function(reason) {
					resolve({ status: 'rejected', reason: reason });
				});
			});
		}));
	};
}

if ('Promise' in globalThis && ! (Promise.any instanceof Function)) {
	Promise.any = (promises) => new Promise((resolve, reject) => {
		let errors = [];

		promises.forEach(promise => {
			promise.then(resolve).catch(e => {
				errors.push(e);
				if (errors.length === promises.length) {
					reject(new globalThis.AggregateError(errors, 'No Promise in Promise.any was resolved'));
				}
			});
		});
	});
}

if ('Promise' in globalThis && ! (Promise.race instanceof Function)) {
	Promise.race = (promises) => new Promise((resolve, reject) => {
		promises.forEach(promise => promise.then(resolve, reject));
	});
}

if (globalThis.hasOwnProperty('Animation') && ! Animation.prototype.hasOwnProperty('finished')) {
	Object.defineProperty(Animation.prototype, 'finished', {
		get: function() {
			return new Promise((resolve, reject) => {
				if (this.playState === 'finished') {
					resolve(this);
				} else {
					this.addEventListener('finish', () => resolve(this), { once: true });
					this.addEventListener('error', event => reject(event), { once: true });
				}
			});
		}
	});
}

if (globalThis.hasOwnProperty('Animation') && ! Animation.prototype.hasOwnProperty('ready')) {
	Object.defineProperty(Animation.prototype, 'ready', {
		get: function() {
			return new Promise((resolve, reject) => {
				if (! this.pending) {
					resolve(this);
				} else {
					this.addEventListener('ready', () => resolve(this), { once: true });
					this.addEventListener('error', event => reject(event), { once: true });
				}
			});
		}
	});
}

if (! (globalThis.requestIdleCallback instanceof Function)) {
	globalThis.requestIdleCallback = function(callback, { timeout = 50 } = {}) {
		const now = Date.now();

		return requestAnimationFrame(function() {
			const idle = {
				timeRemaining: function() {
					return Math.max(0, timeout - (Date.now() - now));
				}
			};

			idle.didTimeout = idle.timeRemaining() === 0;

			callback(idle);
		});
	};
}

if (! ( globalThis.cancelIdleCallback instanceof Function)) {
	globalThis.cancelIdleCallback = function(id) {
		cancelAnimationFrame(id);
	};
}

if (! (globalThis.queueMicrotask instanceof Function)) {
	globalThis.queueMicrotask = cb => Promise.resolve().then(cb)
		.catch(e => setTimeout(() => { throw e; }));
}

/**
 * @SEE https://github.com/tc39/proposal-relative-indexing-method#polyfill
 * @SEE https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 */
if (! (Array.prototype.at instanceof Function)) {
	const at = function at(n) {
		n = Math.trunc(n) || 0;
		if (n < 0) n += this.length;
		if (n < 0 || n >= this.length) return undefined;
		return this[n];
	};

	for (const C of [Array, String, globalThis.Int8Array, globalThis.Uint8Array,
		globalThis.Uint8ClampedArray, globalThis.Int16Array, globalThis.Uint16Array,
		globalThis.Int32Array, globalThis.Uint32Array, globalThis.Float32Array,
		globalThis.Float64Array, globalThis.BigInt64Array, globalThis.BigUint64Array,
	]) {
		if (typeof C !== 'undefined') {
			Object.defineProperty(C.prototype, 'at', {
				value: at,
				writable: true,
				enumerable: false,
				configurable: true
			});
		}
	}
}

if (! (Object.fromEntries instanceof Function)) {
	Object.fromEntries = function(arr) {
		if (Array.isArray(arr)) {
			return arr.reduce((obj, [key, val]) => {
				obj[key] = val;
				return obj;
			}, {});
		} else {
			return Object.fromEntries(Array.from(arr));
		}
	};
}

if (! (navigator.canShare instanceof Function)) {
	navigator.canShare = function({ title, text, url, files } = {}) {
		if (! (navigator.share instanceof Function)) {
			return false;
		} else if (Array.isArray(files) && files.length !== 0) {
			return false;
		} else if ([title, text, url].every(arg => typeof arg === 'undefined')) {
			return true;
		} else {
			return [title, text, url].some(arg => typeof arg === 'string' && arg.length !== 0);
		}
	};
}

if (! (navigator.setAppBadge instanceof Function)) {
	navigator.setAppBadge = async (n) => {
		if (! Number.isInteger(n)) {
			throw new TypeError('Failed to execute \'setAppBadge\' on \'Navigator\': Value is not of type \'unsigned long long\'');
		} else if (n < 0) {
			throw new TypeError('Failed to execute \'setAppBadge\' on \'Navigator\': Value is outside the \'unsigned long long\' value range.');
		} else if (n === 0) {
			if (document.title.startsWith('(')) {
				document.title = document.title.replace(/^\((\d{1,2}\+?)\)\s/, '');
			}
		} else if (n < 100) {
			await navigator.clearAppBadge();
			document.title = `(${n}) ${document.title}`;
		} else {
			await navigator.clearAppBadge();
			document.title = `(99+) ${document.title}`;
		}
	};
}

if (! (navigator.clearAppBadge instanceof Function)) {
	navigator.clearAppBadge = () => navigator.setAppBadge(0);
}

if (! (navigator.getInstalledRelatedApps instanceof Function)) {
	navigator.getInstalledRelatedApps = async () => [];
}

if (! ('connection' in navigator)) {
	navigator.connection = Object.freeze({
		type: 'unknown',
		effectiveType: '4g',
		rtt: NaN,
		downlink: NaN,
		downlinkMax: Infinity,
		saveData: false,
		onchange: null,
		ontypechange: null,
		addEventListener: () => null,
	});
} else if (! ('type' in navigator.connection)) {
	navigator.connection.type = 'unknown';
}

if (! ('doNotTrack' in Navigator.prototype)) {
	Object.defineProperty(Navigator.prototype, 'doNotTrack', {
		get: () => 'unspecified',
	});
}

if (! ('globalPrivacyControl' in Navigator.prototype)) {
	Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', {
		get: () => false,
	});
}

if (! (crypto.randomUUID instanceof Function)) {
	crypto.randomUUID = uuidv4;
}

if (! Element.prototype.hasOwnProperty('toggleAttribute')) {
	Element.prototype.toggleAttribute = function(name, force) {
		const forcePassed = arguments.length === 2;
		const forceOn = !!force;
		const forceOff = forcePassed && !force;

		if (this.hasAttribute(name)) {
			if (forceOn) {
				return true;
			} else {
				this.removeAttribute(name);
				return false;
			}
		} else {
			if (forceOff) {
				return false;
			} else {
				this.setAttribute(name, '');
				return true;
			}
		}
	};
}

if (! (Element.prototype.replaceChildren instanceof Function)) {
	Element.prototype.replaceChildren = function(...items) {
		[...this.children].forEach(el => el.remove());
		this.append(...items);
	};

	Document.prototype.replaceChildren = function(...items) {
		[...this.children].forEach(el => el.remove());
		this.append(...items);
	};

	DocumentFragment.prototype.replaceChildren = function(...items) {
		[...this.children].forEach(el => el.remove());
		this.append(...items);
	};

	if ('ShadowRoot' in globalThis) {
		ShadowRoot.prototype.replaceChildren = function(...items) {
			[...this.children].forEach(el => el.remove());
			this.append(...items);
		};
	}
}

if (! (Element.prototype.getAttributeNames instanceof Function)) {
	Element.prototype.getAttributeNames = function() {
		return Array.from(this.attributes).map(({ name }) => name);
	};
}

if (! HTMLImageElement.prototype.hasOwnProperty('complete')) {
	/**
	 * Note: This shim cannot detect if an image has an error while loading
	 * and will return false on an invalid URL, for example. It also does not
	 * work for 0-sized images, if such a thing is possible.
	 */
	Object.defineProperty(HTMLImageElement.prototype, 'complete', {
		get: function() {
			return this.src === '' || this.naturalHeight > 0;
		}
	});
}

if (! (HTMLImageElement.prototype.decode instanceof Function)) {
	HTMLImageElement.prototype.decode = function () {
		if (this.complete) {
			return Promise.resolve();
		} else {
			return new Promise((resolve, reject) => {
				const load = () => {
					this.removeEventListener('error', error);
					this.removeEventListener('load', load);
					resolve();
				};

				const error = (err) => {
					this.removeEventListener('error', error);
					this.removeEventListener('load', load);
					reject(err);
				};

				this.addEventListener('load', load);
				this.addEventListener('error', error);
			});
		}
	};
}

if (document.createElement('dialog') instanceof HTMLUnknownElement && ! HTMLUnknownElement.prototype.hasOwnProperty('open')) {
	HTMLUnknownElement.prototype.show = function() {
		this.open = true;
	};

	HTMLUnknownElement.prototype.close = function(returnValue = null) {
		this.open = false;
		if (this.tagName === 'DIALOG') {
			const event = new CustomEvent('close');

			if (typeof returnValue === 'string') {
				event.returnValue = true;
				this.returnValue = returnValue;
			}
			this.dispatchEvent(event);
			delete this.returnValue;
		}
	};

	Object.defineProperty(HTMLUnknownElement.prototype, 'open', {
		set: function(open) {
			if (this.tagName === 'DETAILS') {
				this.dispatchEvent(new CustomEvent('toggle'));
				this.toggleAttribute('open', open);
			} else if (this.tagName === 'DIALOG') {
				this.toggleAttribute('open', open);
				if (! open) {
					this.classList.remove('modal');
					const next = this.nextElementSibling;
					if (next instanceof HTMLElement && next.matches('.backdrop')) {
						next.remove();
					}
				}
			}
		},
		get: function() {
			return this.hasAttribute('open');
		}
	});
}

if (! (document.createElement('dialog').showModal instanceof Function)) {
	HTMLUnknownElement.prototype.showModal = function() {
		this.open = true;
		this.classList.add('modal');
		const backdrop = document.createElement('div');
		backdrop.classList.add('backdrop');
		this.after(backdrop);
	};
}

if (! ('content' in document.createElement('template'))) {
	Object.defineProperty(HTMLUnknownElement.prototype, 'content', {
		get: function() {
			const frag = document.createDocumentFragment();
			for (let i = 0; i < this.childNodes.length; i++) {
				frag.appendChild(this.childNodes[i].cloneNode(true));
			}
			return frag;
		}
	});
}

if (! HTMLElement.prototype.hasOwnProperty('contextMenu')){
	Object.defineProperty(HTMLElement.prototype, 'contextMenu', {
		get: function() {
			if (this.hasAttribute('contextmenu')) {
				return document.getElementById(this.getAttribute('contextmenu'));
			} else {
				return null;
			}
		}
	});
}

/**
 * @deprecated [to be removed in 3.0.0]
 */
if (! HTMLLinkElement.prototype.hasOwnProperty('import')) {
	[...document.querySelectorAll('link[rel~="import"]')].forEach(async link => {
		link.import = null;
		const url = new URL(link.href);
		const resp = await fetch(url);

		if (resp.ok) {
			const parser = new DOMParser();
			const content = await resp.text();
			link.import = parser.parseFromString(content, 'text/html');
			link.dispatchEvent(new Event('load'));
		} else {
			link.dispatchEvent(new Event('error'));
		}
	});
}
