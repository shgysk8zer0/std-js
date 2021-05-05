export class AssertionError extends Error {}

export function isAsync(what) {
	return what instanceof Function && what.constructor.name === 'AsyncFunction';
}

const DEFAULT_EXCEPTION = new AssertionError('Assertion failed');

const LITERALS = ['string', 'number', 'boolean'];

export function assert(test, { exception = DEFAULT_EXCEPTION } = {}) {
	if (test !== true) {
		throw exception instanceof Error ? exception : new AssertionError(exception);
	} else {
		return true;
	}
}

export function equals(a, b, { exception } = {}) {
	return assert(a === b, { exception });
}

export function isString(test, { minLength: min = 0, maxLength: max, exception } = {}) {
	if (Number.isInteger(max)) {
		return isString(test, { exception }) && isInteger(test.length, { min, max, exception });
	} else {
		return assert(typeof test === 'string', { exception });
	}
}

export function matches(str, exp, { exception } = {}) {
	return assert(exp.test(str), { exception });
}

export function doesNotMatch(str, exp, { exception } = {}) {
	return assert(! exp.test(str), { exception });
}

export function isNumber(test, { exception, max = Number.MAX_SAFE_INTEGER, min = Number.MIN_SAFE_INTEGER } = {}) {
	return assert(typeof test === 'number' && ! Number.isNaN(test) && test <= max && test >= min, { exception });
}

export function isInteger(test, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, exception } = {}) {
	return assert(Number.isInteger(test) && test >= min && test <= max, { exception });
}

export function isNaN(test, { exception } = {}) {
	return assert(Number.isNaN(test), { exception });
}

export function isArray(test, { minLength: min = 0, maxLength: max, exception } = {}) {
	if (Number.isInteger(max)) {
		return isArray(test, { exception }) && isInteger(test.length, { min, max, exception });
	} else {
		return assert(Array.isArray(test, { exception }));
	}
}

export function instanceOf(test, expected, { exception } = {}) {
	return assert(test instanceof expected, { exception });
}

export function throws(callback, { exception, thisArg = null, args = [] } = {}) {
	if (isAsync(callback)) {
		return rejects(callback(...args), { exception });
	} else {
		let thrown = false;

		try {
			callback.apply(thisArg, args);
		} catch(err) {
			thrown = true;
		}

		return assert(thrown, { exception });
	}
}

export function doesNotThrow(callback, { exception, thisArg = null, args = [] } = {}) {
	if (isAsync(callback)) {
		return rejects(callbac(...args));
	} else {
		let thrown = false;

		try {
			callback.apply(thisArg, args);
		} catch(err) {
			thrown = true;
		}

		return assert(! thrown, { exception });
	}
}

export async function resolves(promise, { exception } = {}) {
	let thrown = false;
	await promise.catch(() => thrown = true);
	return assert(! thrown, { exception });
}

export async function rejects(promise, { exception } = {}) {
	let thrown = false;
	await promise.catch(() => thrown = true);
	return assert(thrown, { exception });
}
