(function(global) {
	'use strict';
	const dependencies = {};

	if (! (Object.hasOwn instanceof Function)) {
		Object.hasOwn = function hasOwn(obj, prop) {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		};
	}

	if (! (Array.prototype.every instanceof Function)) {
		Array.prototype.every = function every(callback, thisArg) {
			if (! (callback instanceof Function)) {
				throw new TypeError('Callback must be a function');
			} else {
				let retVal = true;

				for (let i = 0; i < this.length; i++) {
					if (! callback.call(thisArg, this[i], i, this)) {
						retVal = false;
						break;
					}
				}

				return retVal;
			}
		};
	}

	function getDeferred() {
		const def = {};

		def.promise = new Promise(function(resolve, reject) {
			def.resolve = resolve;
			def.reject = reject;
		});

		return Object.seal(def);
	}

	function whenDefined(deps) {
		return Promise.all(deps.map(dep => global.require(dep)));
	}

	global.require = function(dep) {
		if (! Object.hasOwn(dependencies, dep)) {
			Object.defineProperty(dependencies, dep, { value: getDeferred(), enumerable: true, writable: false });
		}

		return dependencies[dep].promise;
	};

	global.define = function define(...args) {
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
	};
})(globalThis);
