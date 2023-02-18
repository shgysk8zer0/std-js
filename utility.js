import { randomInt } from './math.js';
import { isAsyncFunction } from './promises.js';

const funcs = new WeakMap();

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

		case 'object':
			return Object.is(thing, null) ? 'Null' : thing.constructor.name;

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
	return getType(thing) === expectedType;
}

export function sameType(thing1, thing2) {
	return isA(thing1, getType(thing2));
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
