import { randomInt } from './math.js';

const funcs = new WeakMap();

export function getURLResolver({ base = document.baseURI, path = './' } = {}) {
	const url = new URL(path, base).href;

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
	return isUndefined(val) || isNull(val) || Number.isNaN(val);
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
	const func = function(...args) {
		if (funcs.has(func)) {
			return funcs.get(func);
		} else {
			const retVal = callback.apply(thisArg, args);
			funcs.set(func, retVal);
			return retVal;
		}
	};

	return func;
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
	if (! (url instanceof URL)) {
		return setURLParams(url, { utm_source, utm_medium, utm_content, utm_campaign, utm_term });
	} else {
		return new URL(url, document.baseURI);
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
