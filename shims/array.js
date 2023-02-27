(function() {
	'use strict';

	/**
	 * @SEE https://github.com/tc39/proposal-relative-indexing-method#polyfill
	 * @SEE https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
	 */

	const SHIM_TARGETS = [Array, String, globalThis.Int8Array, globalThis.Uint8Array,
		globalThis.Uint8ClampedArray, globalThis.Int16Array, globalThis.Uint16Array,
		globalThis.Int32Array, globalThis.Uint32Array, globalThis.Float32Array,
		globalThis.Float64Array, globalThis.BigInt64Array, globalThis.BigUint64Array,
	];

	if (! (Array.prototype.flat instanceof Function)) {
		Array.prototype.flat = function(depth = 1) {
			const result = [];
			depth = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, depth));

			const flattenFn = (item, depth) => {
				if (Array.isArray(item) && depth >= 0) {
					item.forEach(i => flattenFn(i, depth - 1));
				} else {
					result.push(item);
				}
			};

			flattenFn(this, Number.isNaN(depth) ? 0 : depth);
			return result;
		};
	}

	if (! (Array.prototype.flatMap instanceof Function)) {
		Array.prototype.flatMap = function(cb, thisArg) {
			return this.map(cb, thisArg).flat(1);
		};
	}

	if (! (Array.prototype.findLast instanceof Function)) {
		Array.prototype.findLast = function(callback, thisArg) {
			let found = undefined;

			this.forEach((item, index, arr) => {
				if (callback.call(thisArg, item, index, arr)) {
					found = item;
				}
			}, thisArg);

			return found;
		};
	}

	if (! (Array.prototype.findLastIndex instanceof Function)) {
		Array.prototype.findLastIndex = function(callback, thisArg) {
			let found = -1;

			this.forEach((item, index, arr) => {
				if (callback.call(thisArg, item, index, arr)) {
					found = index;
				}
			}, thisArg);

			return found;
		};
	}

	if (! (Array.prototype.at instanceof Function)) {
		const at = function at(n) {
			n = Math.trunc(n) || 0;
			if (n < 0) n += this.length;
			if (n < 0 || n >= this.length) return undefined;
			return this[n];
		};

		for (const C of SHIM_TARGETS) {
			if (typeof C !== 'undefined') {
				Object.defineProperty(C.prototype, 'at', {
					value: at,
					writable: true,
					enumerable: false,
					configurable: true
				});
			}
		}
	}

	/**
	 * @see https://github.com/tc39/proposal-array-grouping
	 */
	if (! (Array.prototype.group instanceof Function)) {
		Array.prototype.group = function group(callback, thisArg = globalThis) {
			return this.reduce((groups, item, index, arr) => {
				const key = callback.call(thisArg, item, index, arr);

				if (! groups.hasOwnProperty(key)) {
					groups[key] = [item];
				} else {
					groups[key].push(item);
				}

				return groups;
			}, {});
		};
	}

	/**
	 * @deprecated [renamed to `group()`]
	 */
	Array.prototype.groupBy = function groupBy(...args) {
		console.warn('`goupBy` is deprecated. Please use `group` instead.');
		return this.group(...args);
	};

	/**
	 * @see https://github.com/tc39/proposal-array-grouping
	 * @requires `Map.prototype.emplace`
	 */
	if (! (Array.prototype.groupToMap instanceof Function) && (Map.prototype.emplace instanceof Function)) {
		Array.prototype.groupToMap = function groupToMap(callback, thisArg = globalThis) {
			return this.reduce((map, item, index, arr) => {
				map.emplace(callback.call(thisArg, item, index, arr), {
					insert: () => [item],
					update: existing => {
						existing.push(item);
						return existing;
					}
				});

				return map;
			}, new Map());
		};
	}

	/**
	 * @deprecated [renamed to `groupToMap()`]
	 */
	if (Map.prototype.emplace instanceof Function) {
		Array.prototype.groupByToMap = function groupByToMap(...args) {
			console.warn('`goupByToMap` is deprecated. Please use `groupToMap` instead.');
			return this.groupToMap(...args);
		};
	}

	/**
	 * @see https://github.com/tc39/proposal-array-from-async
	 */
	if (! (Array.fromAsync instanceof Function)) {
		Array.fromAsync = async function fromAsync(items, mapFn, thisArg = globalThis) {
			let arr = [];

			for await (const item of items) {
				arr.push(await item);
			}

			return Array.from(arr, mapFn, thisArg);
		};
	}

	/**
	 * @see https://github.com/tc39/proposal-array-equality/
	 */
	if (! (Array.prototype.equals instanceof Function)) {
		Array.prototype.equals = function equals(arr) {
			if (this === arr) {
				return true;
			} else if (! Array.isArray(arr)) {
				return false;
			} else if (this.length !== arr.length) {
				return false;
			} else {
				return this.every((item, i) => {
					const val = arr[i];
					if (Array.isArray(item)) {
						return Array.isArray(val) && item.equals(val);
					} else {
						return Object.is(item, val);
					}
				});
			}
		};
	}
	/**
	 * @see https://github.com/tc39/proposal-array-unique
	 */
	if (! (Array.prototype.uniqueBy instanceof Function)) {
		Array.prototype.uniqueBy = function uniqueBy(arg) {
			if (typeof arg === 'undefined') {
				return [...new Set(this)];
			} else if (typeof arg === 'string') {
				const found = [];

				return this.filter(obj => {
					const key = obj[arg];
					if (found.includes(key)) {
						return false;
					} else {
						found.push(key);
						return true;
					}
				});
			} else if (arg instanceof Function) {
				const found = [];

				return this.filter((...args) => {
					try {
						const key = arg.apply(this, args);

						if (typeof key !== 'string') {
							return false;
						} else if (found.includes(key)) {
							return false;
						} else {
							found.push(key);
							return true;
						}
					} catch(err) {
						return false;
					}
				});
			} else {
				throw new TypeError('Not a valid argument for uniqueBy');
			}
		};
	}

	/**
	 * Change Array by copy proposal
	 * @Note: Not clear if should use `structedClone` or `[...this]` for copies
	 * @see https://github.com/tc39/proposal-change-array-by-copy
	 */
	if (! (Array.prototype.toReversed instanceof Function)) {
		Array.prototype.toReversed = function toReversed() {
			return [...this].reverse();
		};
	}

	if (! (Array.prototype.toSorted instanceof Function)) {
		Array.prototype.toSorted = function toSorted(cmpFn) {
			return [...this].sort(cmpFn);
		};
	}

	if (! (Array.prototype.toSpliced instanceof Function)) {
		Array.prototype.toSpliced = function toSpliced(start, deleteCount, ...items) {
			const cpy = [...this];
			cpy.splice(start, deleteCount, ...items);
			return cpy;
		};
	}

	if (! (Array.prototype.with instanceof Function)) {
		Array.prototype.with = function (index, value) {
			const cpy = [...this];
			cpy[index] = value;
			return cpy;
		};
	}
})();
