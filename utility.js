import { randomInt } from './math.js';

const funcs = new WeakMap();

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

export function setUTMParams(url, {
	source: utm_source,
	medium: utm_medium = 'referral',
	content: utm_content,
	campaign: utm_campaign,
	term: utm_term,
} = {}) {
	if (typeof utm_source === 'string') {
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
