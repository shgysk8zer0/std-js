import { parse } from './dom.js';

export class AssertionError extends Error {}

export function isAsync(what) {
	return what instanceof Function && what.constructor.name === 'AsyncFunction';
}

export function getType(obj) {
	const type = typeof obj;

	if (LITERALS.includes(type)) {
		return type;
	} else if (obj === null) {
		return 'null';
	} else if (Array.isArray(obj)) {
		return 'Array';
	} else if (obj.hasOwnProperty('constructor') && typeof obj.constructor.name === 'string') {
		return obj.constructor.name;
	} else if (obj instanceof Element) {
		return `<${obj.tagName.toLowerCase()}>`;
	} else if (obj.toString instanceof Function) {
		return obj.toString();
	} else {
		return type;
	}
}

const DEFAULT_EXCEPTION = 'Assertion failed';

const LITERALS = ['string', 'number', 'boolean', 'undefined', 'symbol'];

function getError(exception = DEFAULT_EXCEPTION) {
	return exception instanceof Error ? exception : new AssertionError(exception);
}

export function assert(test, { exception = DEFAULT_EXCEPTION, throws = true } = {}) {
	if (test !== true) {
		if (throws === true) {
			throw getError(exception);
		} else {
			return false;
		}
	} else {
		return true;
	}
}

export function equals(a, b, { exception, throws } = {}) {
	if (Number.isNaN(a)) {
		return isNaN(b, { exception, throws });
	} else {
		return assert(a === b, { exception, throws });
	}
}

export function deepEquals(a, b, { exception, throws } = {}) {
	if (a === b) {
		return true;
	} else if (typeof a !== typeof b) {
		if (throws) {
			throw getError(exception);
		} else {
			return false;
		}
	} else if (LITERALS.includes(typeof a)) {
		return equals(a, b, { exception, throws });
	} else if (Array.isArray(a)) {
		return assert(a.length === b.length && (a.every(val => b.includes(val)
			|| b.some(valb => deepEquals(val, valb, { throws: false }))
		)), { exception, throws });
	} else if (a instanceof Element) {
		return domEquals(a, b, { exception, throws });
	} else if (a instanceof DOMTokenList) {
		if (b instanceof DOMTokenList) {
			return assert(
				b instanceof DOMTokenList && a.length === b.maxLength
				&& Array.from(a).every(cl => b.has(cl)),
				{ throws, exception }
			);
		} else if (Array.isArray(b)) {
			return assert(a.length === b.length && b.every(cl => a.has(cl), { throws, exception });
		} else {
			throw getError(`Cannot cmpare DOMTokenList to `)
		}
	} else if (a !== null) {
		return deepEquals(Object.keys(a), Object.keys(b), { exception, throws })
			&& Object.entries(a).every(([key, value]) => deepEquals(value, b[key], { exception, throws }));
	} else {
		return equals(b, null, { exception, throws });
	}
}

export function isString(test, { minLength: min = 0, maxLength: max, exception, throws } = {}) {
	if (Number.isInteger(max)) {
		return isString(test, { exception, throws }) && isInteger(test.length, { min, max, exception, throws });
	} else {
		return assert(typeof test === 'string', { exception, throws });
	}
}

export function includes(test, search, { exception, throws } = {}) {
	return assert(test.includes(search), { exception, throws });
}

export function matches(str, exp, { exception, throws } = {}) {
	return assert(exp.test(str), { exception, throws });
}

export function doesNotMatch(str, exp, { exception, throws } = {}) {
	return assert(! exp.test(str), { exception, throws });
}

export function isNumber(test, { exception, max = Number.MAX_SAFE_INTEGER, min = Number.MIN_SAFE_INTEGER, throws } = {}) {
	return assert(typeof test === 'number' && ! Number.isNaN(test) && test <= max && test >= min, { exception, throws });
}

export function isInteger(test, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, exception, throws } = {}) {
	return assert(Number.isInteger(test) && test >= min && test <= max, { exception, throws });
}

export function isNaN(test, { exception, throws } = {}) {
	return assert(Number.isNaN(test), { exception, throws });
}

export function isArray(test, { minLength: min, maxLength: max, exception, throws } = {}) {
	if (Number.isInteger(max) || Number.isInteger(min)) {
		return isArray(test, { exception, throws }) && isInteger(test.length, { min, max, exception, throws });
	} else {
		return assert(Array.isArray(test, { exception, throws }));
	}
}

export function domEquals(given, expected, { exception, throws } = {}) {
	if (typeof expected === 'string') {
		expected = parse(expected).firstElementChild;
	}

	if (given instanceof Element) {
		return assert((expected instanceof Element) && (
			given.isSameNode(expected) || (
				given.tagName === expected.tagName
				&& given.attributes.length === expected.attributes.length
				&& given.childNodes.length === expected.childNodes.length
				&& Array.from(given.attributes).every(
					({ localName, value }) => expected.getAttribute(localName) === value
				)
				&& Array.from(given.childNodes).every(
					(el, i) => domEquals(el, expected.childNodes.item(i), { throws: false })
				)
			)
		), { exception, throws });
	} else if (given instanceof Node && given.nodeType === Node.TEXT_NODE) {
		return assert(expected instanceof Node && given.nodeType === Node.TEXT_NODE
			&& expected.wholeText === expected.wholeText, { throws, exception });
	} else {
		throw new AssertionError('Cannot run test on non-element or string');
	}
}

export function instanceOf(test, expected, { exception, throws } = {}) {
	return assert(test instanceof expected, { exception, throws });
}

export function throws(callback, { exception, thisArg = null, args = [], throws, type } = {}) {
	if (isAsync(callback)) {
		return rejects(callback(...args), { exception, throws, type });
	} else {
		let thrown;

		try {
			callback.apply(thisArg, args);
		} catch(err) {
			thrown = err;
		}

		if (typeof type !== 'undefined') {
			return instanceOf(thrown, type, { exception, throws });
		} else {
			return assert(thrown instanceof type, { exception, throws });
		}

	}
}

export function doesNotThrow(callback, { exception, thisArg = null, args = [], throws } = {}) {
	if (isAsync(callback)) {
		return resolves(callback(...args), { exception, throws });
	} else {
		let thrown = false;

		try {
			callback.apply(thisArg, args);
		} catch(err) {
			thrown = true;
		}

		return assert(! thrown, { exception, throws });
	}
}

export async function resolves(promise, { exception, throws } = {}) {
	let thrown = false;
	await promise.catch(() => thrown = true);
	return assert(! thrown, { exception, throws });
}

export async function rejects(promise, { exception, throws, type } = {}) {
	let thrown;

	await promise.catch(err => thrown = err);
	if (typeof type !== 'undefined') {
		return instanceOf(thrown, type, { exception, throws });
	} else {
		return equals(typeof thrown, 'undefined', { exception, throws });
	}
}
