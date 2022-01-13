/**
 * @SEE https://github.com/tc39/proposal-relative-indexing-method#polyfill
 * @SEE https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 */
if (! (Array.prototype.at instanceof Function)) {
	const at = function at(n) {
		n = Math.trunc(n) || 0;
		if (n < 0) n += this.length;
		if (n < 0 || n >= this.length) return undefined;
		return this[n];
	};

	for (const C of [Array, String, globalThis.Int8Array, globalThis.Uint8Array,
		globalThis.Uint8ClampedArray, globalThis.Int16Array, globalThis.Uint16Array,
		globalThis.Int32Array, globalThis.Uint32Array, globalThis.Float32Array,
		globalThis.Float64Array, globalThis.BigInt64Array, globalThis.BigUint64Array,
	]) {
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
