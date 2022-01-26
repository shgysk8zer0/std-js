/**
 * @SEE https://github.com/tc39/proposal-relative-indexing-method#polyfill
 * @SEE https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 */

const SHIM_TARGETS = [Array, String, globalThis.Int8Array, globalThis.Uint8Array,
	globalThis.Uint8ClampedArray, globalThis.Int16Array, globalThis.Uint16Array,
	globalThis.Int32Array, globalThis.Uint32Array, globalThis.Float32Array,
	globalThis.Float64Array, globalThis.BigInt64Array, globalThis.BigUint64Array,
];

if (! (Array.from instanceof Function)) {
	Array.from = function from(iter) {
		return Array.of(...iter);
	};
}

if (! (Array.of instanceof Function)) {
	Array.of = function of(...items) {
		return items;
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
if (! (Array.prototype.groupBy instanceof Function)) {
	Array.prototype.groupBy = function groupBy(callback, thisArg = this) {
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
 * @see https://github.com/tc39/proposal-array-grouping
 */
if (! (Array.prototype.groupByToMap instanceof Function)) {
	Array.prototype.groupByToMap = function groupByToMap(callback, thisArg = this) {
		return this.reduce((map, item, index, arr) => {
			const key = callback.call(thisArg, item, index, arr);

			if (! map.has(key)) {
				map.set(key, [item]);
			} else {
				map.get(key).push(item);
			}

			return map;
		}, new Map());
	};
}

/**
 * @see https://github.com/tc39/proposal-array-from-async
 */
if (! (Array.fromAsync instanceof Function)) {
	Array.fromAsync = async function fromAsync(items) {
		let arr = [];

		for await (const item of items) {
			arr.push(await item);
		}

		return arr;
	};
}
