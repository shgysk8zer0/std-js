import { deepEquals, isA, isObject, getType } from './utility.js';
import { getAttrs } from './attrs.js';

export function toThrow() {
	return async (what, err = new Error('Test failed')) => {
		let threw = false;

		try {
			await what();
		} catch(e) {
			threw = true;
		}

		if (! threw) {
			throw err;
		}
	};
}

export function toThrowA(errType) {
	return async (what, err = new Error('Test failed')) => {
		let thrown;

		try {
			await what();
		} catch(e) {
			thrown = e;
		}

		if (! isA(thrown, errType)) {
			throw err;
		}
	};
}

export function toNotThrow() {
	return async (what, err = new Error('Test failed')) => {
		try {
			await what();
		} catch(e) {
			console.error(e);
			throw err;
		}
	};
}

export function toBe(expectedType) {
	return async (what, err = new Error('Test failed')) => {
		if (! isA(await what(), expectedType)) {
			throw err;
		}
	};
}

export function toEqual(expectedVal) {
	return async (what, err = new Error('Test failed')) => {
		if (! deepEquals(await what(), expectedVal)) {
			throw err;
		}
	};
}

export function toHaveAttrs(attrs) {
	if (Array.isArray(attrs)) {
		return async (what, err = new Error('Test failed')) => {
			const el = await what();

			if (! (el instanceof Element)) {
				throw new TypeError('Did not return an Element');
			} else {
				const attributes = Object.keys(getAttrs(el));

				if (! attrs.every(attr => attributes.includes(attr))) {
					throw err;
				}
			}
		};
	} else if (isObject(attrs)) {
		return async (what, err = new Error('Test failed')) => {
			const el = await what();

			if (! (el instanceof Element)) {
				throw new Error('Did not return an Element');
			} else {
				if (! Object.entries(attrs).every(([k, v]) => el.getAttribute(k) === v)) {
					throw err;
				}
			}
		};
	}
}

export async function expect(func, test, err = new Error('Test Failed')) {
	if (typeof err === 'string') {
		await expect(func, test, new Error(err));
	} else if (! (err instanceof Error)) {
		throw new Error(`Expected err to be an Error but got a ${getType(err)}`);
	} else if (! (test instanceof Function)) {
		throw new TypeError(`Expected test to be a Function but got a ${getType(test)}`);
	} else if (! (func instanceof Function)) {
		await expect(() => func, test, err);
	} else {
		await test(func, err);
	}
}

export async function runTests(...tests) {
	const results = await Promise.allSettled(tests);
	const errors = results
		.filter(({ status }) => status === 'rejected')
		.map(({ reason }) => reason);

	if (errors.length !== 0) {
		throw new AggregateError(errors, `${errors.length} tests failed`);
	}
}
