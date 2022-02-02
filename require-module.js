const dependencies = {};
const loading = {};

function getDeferred() {
	const def = {};
	def.promise = new Promise((resolve, reject) => {
		def.resolve = resolve;
		def.reject = reject;
	});

	return def;
}

function getDependency(dep) {
	if (typeof dep !== 'string' || dep.length === 0) {
		throw new TypeError('Invalid dependency name');
	} else if (! hasDependency(dep)) {
		throw new DOMException(`${dep} is not defined`);
	} else {
		return dependencies[dep];
	}
}

async function loadDependency(dep) {
	if (typeof dep !== 'string' || dep.length === 0) {
		throw new TypeError('Invalid dependency name');
	} else if (hasDependency(dep)) {
		return Promise.resolve(getDependency(dep));
	} else if (! isLoading(dep)) {
		Object.defineProperty(loading, dep, {
			enumberable: true,
			configurable: true,
			value: getDeferred(),
		});
	}

	return await loading[dep].promise;
}

function hasDependency(dep) {
	return Object.hasOwn(dependencies, dep);
}

function isLoading(dep) {
	return Object.hasOwn(loading, dep);
}

export function require(...args) {
	switch(args.length) {
		case 0:
			throw new Error('No arguments given to `require()`');

		case 1:
			if (Array.isArray(args[0])) {
				return args[0].map(dep => require(dep));
			} else if (typeof args[0] === 'string' && args[0].length !== 0) {
				return getDependency(args[0]);
			} else {
				throw new TypeError('Invalid arguments for `require()`');
			}

		case 2:
			const [deps, callback] = args;

			if (! (callback instanceof Function)) {
				throw new TypeError('`require()` callback must be a function');
			} else if (! Array.isArray(deps)) {
				throw new TypeError(`require() dependencies must be an array`);
			} else {
				return callback.apply(null, require(deps));
			}
	}
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
			} else if (hasDependency(name)) {
				throw new Error(`${name} is already defined`);
			} else {
				if (! Object.hasOwn(loading, name)) {
					Object.defineProperty(loading, name, {
						enumerable: true,
						configurable: true,
						value: getDeferred(),
					});
				}

				return define(deps, async (...mods) => {
					const { resolve, reject, promise } = loading[name];

					try {
						const mod = await callback.apply(null, mods);
						dependencies[name] = mod;
						resolve(mod);
						delete loading[name];
					} catch(err) {
						reject(err);
					} finally {
						return promise;
					}
				});
			}
		}

		case 2: {
			const [deps, callback] = args;

			if (! (callback instanceof Function)) {
				throw new TypeError('Callback must be a function');
			} else if (! (Array.isArray(deps) && deps.every(dep => typeof dep === 'string' && dep.length !== 0))) {
				throw new TypeError('Dependencies must be an array of strings or empty array');
			} else {
				return Promise.all(deps.map(dep => loadDependency(dep))).then(mods => callback.apply(null, mods));
			}
		}

		default:
			throw new TypeError('Invalid arguments to `define()`');
	}
}

dependencies.require = require;
