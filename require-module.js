import { getDeferred } from './promises.js';
const dependencies = {};

/**
 * @todo Make this synchronous and throw if a module is not defined
 */
export async function require(...args) {
	switch(args.length) {
		case 0:
			throw new Error('No arguments given to `require()`');

		case 1:
			if (Array.isArray(args[0])) {
				return Promise.all(args[0].map(dep => require(dep)));
			} else if (typeof args[0] === 'string' && args[0].length !== 0) {
				if (! Object.hasOwn(dependencies, args[0])) {
					Object.defineProperty(dependencies, args[0], {
						value: getDeferred(),
						enumerable: true,
						writable: false
					});
				}

				return dependencies[args[0]].promise;
			} else {
				throw new TypeError('Invalid arguments for `require()`');
			}

		case 2:
			const [deps, callback] = args;

			if (callback instanceof Function) {
				return require(deps).then(mods => {
					if (Array.isArray(mods)) {
						return callback.apply(null, mods);
					} else {
						return callback.call(null, mods);
					}
				});
			} else {
				throw new TypeError('`require()` callback must be a function');
			}
	}
}

/**
 * @todo Remove use of `require()` and implement similar async loading instead
 */
export function define(...args) {
	switch(args.length) {
		case 3: {
			const [name, deps, callback] = args;

			if (typeof name !== 'string' || name.length === 0) {
				throw new TypeError('Invalid name');
			} else if (! (callback instanceof Function)) {
				throw new TypeError('Callback must be a function');
			} else if (! (Array.isArray(deps) && deps.every(dep => typeof dep === 'string' && dep.length !== 0))) {
				throw new TypeError('Dependencies must be an array of strings');
			} else {
				if (! Object.hasOwn(dependencies, name)) {
					Object.defineProperty(dependencies, name, { enumerable: true, value: getDeferred() });
				}

				const { resolve, reject } = dependencies[name];
				return require(deps, callback).then(resolve, reject);
			}
		}

		case 2: {
			const [deps, callback] = args;

			if (! (callback instanceof Function)) {
				throw new TypeError('Callback must be a function');
			} else if (! (Array.isArray(deps) && deps.every(dep => typeof dep === 'string' && dep.length !== 0))) {
				throw new TypeError('Dependencies must be an array of strings or empty array');
			} else {
				return require(deps, callback);
			}
		}

		default:
			throw new TypeError('Invalid arguments to `define()`');
	}
}

define('require', [], () => require);
