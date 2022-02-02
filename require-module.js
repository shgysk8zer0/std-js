import { getDeferred } from './promises.js';
const dependencies = {};

async function whenDefined(deps) {
	return Promise.all(deps.map(dep => require(dep)));
}

export async function require(dep) {
	if (! Object.hasOwn(dependencies, dep)) {
		Object.defineProperty(dependencies, dep, {
			value: getDeferred(),
			enumerable: true,
			writable: false
		});
	}

	return dependencies[dep].promise;
}

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
				return whenDefined(deps).then(args => callback.apply(globalThis, args)).then(resolve).catch(reject);
			}
		}

		case 2: {
			const [deps, callback] = args;

			if (! (callback instanceof Function)) {
				throw new TypeError('Callback must be a function');
			} else if (! (Array.isArray(deps) && deps.every(dep => typeof dep === 'string' && dep.length !== 0))) {
				throw new TypeError('Dependencies must be an array of strings or empty array');
			} else {
				return whenDefined(deps).then(args => callback.apply(globalThis, args));
			}
		}

		default:
			throw new TypeError('Invalid arguments');
	}
}
