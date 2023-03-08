import { randomInt } from './math.js';
import { isAsyncFunction, getDeferred } from './promises.js';
import { isScriptURL, isTrustPolicy } from './trust.js';

const funcs = new WeakMap();

export function isStrictMode() {
	// Probably always true
	return typeof this === 'undefined';
}

export const autoServiceWorkerRegistration = callOnce(async ({ policy, } = {}) => {
	if ('serviceWorker' in navigator && 'serviceWorker' in document.documentElement.dataset) {
		const { serviceWorker, scope = '/' } = document.documentElement.dataset;

		try {
			if (isTrustPolicy(policy)) {
				await navigator.serviceWorker.register(policy.createScriptURL(serviceWorker), { scope });
			} else if('trustedTypes' in globalThis && isTrustPolicy(trustedTypes.defaultPolicy)) {
				await navigator.serviceWorker.register(trustedTypes.defaultPolicy.createScriptURL(serviceWorker), { scope });
			} else {
				await navigator.serviceWorker.register(serviceWorker, { scope });
			}

			await reloadOnUpdate();
		} catch(err) {
			console.error(err);
		}
	}
});

export async function reloadOnUpdate() {
	if ('serviceWorker' in navigator && 'reloadOnUpdate' in document.documentElement.dataset) {
		const reg = await navigator.serviceWorker.ready;

		reg.addEventListener('updatefound', async ({ target }) => {
			target.update();

			const HTMLNotificationElement = await customElements.whenDefined('html-notification');
			const notification = new HTMLNotificationElement('Update available', {
				body: 'App updated in background. Would you like to reload to see updates?',
				requireInteraction: true,
				actions: [{
					title: 'Reload',
					action: 'reload',
				}, {
					title: 'Dismiss',
					action: 'dismiss',
				}]
			});

			notification.addEventListener('notificationclick', ({ target, action }) => {
				switch(action) {
					case 'dismiss':
						target.close();
						break;

					case 'reload':
						target.close();
						location.reload();
						break;
				}
			});
		});
	}
}

export async function registerServiceWorker(source, {
	scope,
	policy = 'trustedTypes' in globalThis ? trustedTypes.defaultPolicy : null,
	type = 'classic',
	updateViaCache = 'none',
} = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (! ('serviceWorker' in navigator && navigator.serviceWorker.register instanceof Function)) {
		reject(new DOMException('Service worker not supported'));
	} else if (! (typeof source === 'string' || isScriptURL(source) || source instanceof URL)) {
		reject(new TypeError('Invalid Service worker registration source'));
	} else if (isTrustPolicy(policy)) {
		navigator.serviceWorker.register(
			policy.createScriptURL(source),
			{ scope, type, updateViaCache }
		).then(resolve).catch(reject);
	} else {
		navigator.serviceWorker.register(source, { scope, type, updateViaCache })
			.then(resolve).catch(reject);
	}

	return await promise;
}

export function getURLResolver({ base = document.baseURI, path = './' } = {}) {
	const url = new URL(path, base);

	return path => new URL(path, url).href;
}

export function isObject(thing) {
	return typeof thing === 'object' && ! Object.is(thing, null) && ! Array.isArray(thing);
}

export function isNull(val) {
	return Object.is(val, null);
}

export function isUndefined(val) {
	return typeof val === 'undefined';
}

export function isNullish(val) {
	switch (typeof val) {
		case 'undefined':
			return true;

		case 'object':
			if (Object.is(val, null)) {
				return true;
			} else if (Array.isArray(val)) {
				return val.length === 0;
			} else if (val instanceof Date) {
				return Number.isNaN(val.getTime());
			} else {
				return false;
			}

		case 'number':
			return Number.isNaN(val);

		case 'string':
			return val.length === 0;

		default:
			return false;
	}
}

export function getType(thing) {
	switch (typeof thing) {
		case 'undefined':
			return 'Undefined';

		case 'function':
			if ('prototype' in thing) {
				return getType(thing.prototype);
			} else if ('constructor' in thing) {
				return thing.constructor.name;
			} else {
				return 'Function';
			}

		case 'object':
			if (Object.is(thing, null)) {
				return 'Null';
			} else if ('constructor' in thing) {
				return thing.constructor.name;
			} else if (Symbol.toStringTag in thing) {
				return thing[Symbol.toStringTag];
			} else if ('prototype' in thing) {
				return  getType(thing.prototype);
			} else {
				console.log(thing);
				return 'Unknown Object';
			}

		case 'string':
			return 'String';

		case 'number':
			return Number.isNaN(thing) ? 'NaN' : 'Number';

		case 'bigint':
			return 'BigInt';

		case 'boolean':
			return 'Boolean';

		case 'symbol':
			return 'Symbol';

		default:
			return 'Unknown';
	}
}

export function isA(thing, expectedType) {
	if (typeof expectedType === 'string') {
		return getType(thing) === expectedType;
	} else if (isObject(expectedType) && 'constructor' in expectedType) {
		return isA(thing, expectedType.constructor.name);
	} else {
		throw new TypeError('Invalid argument for `expectedType`');
	}
}

export function sameType(thing1, thing2) {
	return isA(thing1, getType(thing2));
}

export function deepEquals(thing1, thing2, { depth = 5 } = {}) {
	const type1 = getType(thing1);
	const type2 = getType(thing2);

	if (! Number.isSafeInteger(depth)) {
		throw new TypeError('`depth` must be an integer');
	} else if (type1 !== type2) {
		return false;
	} else if (thing1 === thing2) {
		return true;
	} else {
		depth--;
		switch(type1) {
			case 'NaN':
				// Since NaN !== NaN
				return true;

			case 'BigInt':
			case 'Number':
			case 'String':
			case 'Symbol':
				// Already know not equal
				return false;

			case 'Object':
				return depth < 0 || deepEquals(Object.entries(thing1), Object.entries(thing2), { depth });

			case 'Array':
				return depth < 0 || (
					thing1.length === thing2.length
					&& thing1.every((thing, i) => deepEquals(thing, thing2[i], { depth }))
				);

			case 'Map':
			case 'Set':
				return depth < 0 || deepEquals([...thing1], [...thing2], { depth });

			case 'URL':
				return thing1.href === thing2.href;

			default:
				if (thing1 instanceof Node) {
					return thing1.isSameNode(thing2);
				} else if (Symbol.iterator in thing1) {
					return depth < 0 || deepEquals([...thing1], [...thing2], { depth });
				} else {
					// Since already not `===`
					return false;
				}
		}
	}
}

/* global define */
export function amd(name, factory, requires = {}) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		try {
			define(name, requires, factory);
			return true;
		} catch(err) {
			console.error(err);
			return false;
		}
	} else {
		return false;
	}
}

export function errorToEvent(error, type = 'error') {
	if (error instanceof Error) {
		const { message, name, fileName: filename, lineNumber: lineno, columnNumber: colno } = error;
		return new ErrorEvent(type, { error, message: `${name}: ${message}`, filename, lineno, colno });
	} else {
		throw new TypeError('`errorToEvent()` only accepts Errors');
	}
}


export function callOnce(callback, thisArg) {
	if (callback.once instanceof Function) {
		return callback.once(thisArg);
	} else {
		return function(...args) {
			if (funcs.has(callback)) {
				return funcs.get(callback);
			} else if (isAsyncFunction(callback)) {
				const retVal = callback.apply(thisArg || this, args).catch(err => {
					funcs.delete(callback);
					throw err;
				});

				funcs.set(callback, retVal);
				return retVal;
			} else if (callback instanceof Function) {
				const retVal = callback.apply(thisArg || this, args);
				funcs.set(callback, retVal);
				return retVal;
			}
		};
	}
}

export function setURLParams(forURL, params) {
	const url = new URL(forURL, document.baseURI);

	if (params instanceof HTMLFormElement) {
		return setURLParams(url, new FormData(params));
	} else if (params instanceof FormData) {
		return setURLParams(url, Object.fromEntries(params));
	} else if (params instanceof URLSearchParams) {
		return setURLParams(url, Object.fromEntries(params));
	} else if (Array.isArray(params) || typeof params === 'string') {
		return setURLParams(url, new URLSearchParams(params));
	} else if (isObject(params)) {
		Object.entries(params).forEach(([k, v]) => {
			if (typeof v === 'string' || (typeof v === 'number' && ! Number.isNaN(v))) {
				url.searchParams.set(k, v);
			} else if (typeof v === 'boolean') {
				if (v) {
					url.searchParams.set(k, '');
				} else {
					url.searchParams.delete(k);
				}
			} else if (! isNullish(v)) {
				url.searchParams.set(k, v.toString());
			}
		});
	}

	return url;
}

export function setUTMParams(url, {
	source: utm_source,
	medium: utm_medium = 'referral',
	content: utm_content,
	campaign: utm_campaign,
	term: utm_term,
} = {}) {
	if (isNullish(url)) {
		return null;
	} else if (! (url instanceof URL)) {
		return setUTMParams(new URL(url, document.baseURI), {
			source: utm_source,
			medium: utm_medium,
			content: utm_content,
			campaign: utm_campaign,
			term: utm_term,
		});
	} else if (typeof utm_source !== 'string') {
		return url;
	} else {
		return setURLParams(url, { utm_source, utm_medium, utm_content, utm_campaign, utm_term });
	}
}

export function debounce(callback, { delay = 17, thisArg } = {}) {
	if (! (callback instanceof Function)) {
		throw new TypeError('Callback must be a function');
	} else if (! Number.isFinite(delay) || delay < 0) {
		throw new TypeError('Timeout must be a positive intiger');
	} else {
		let to;
		return function(...args) {
			if (typeof to === 'number') {
				clearTimeout(to);
				to = null;
			}
			to = setTimeout((...args) => callback.apply(thisArg, args), delay, ...args);
		};
	}
}

export function throttle(callback, { delay = 17, thisArg } = {}) {
	if (! (callback instanceof Function)) {
		throw new TypeError('Callback must be a function');
	} else if (! Number.isFinite(delay) || delay < 0) {
		throw new TypeError('Timeout must be a positive intiger');
	} else {
		let to;
		return function(...args) {
			if (typeof to !== 'number') {
				to = setTimeout(() => to = null, delay);
				callback.apply(thisArg, args);
			}
		};
	}
}

export function random(arr) {
	if (Array.isArray(arr) && arr.length !== 0) {
		return arr[randomInt(0, arr.length)];
	}
}
