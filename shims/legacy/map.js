(function() {
	'use strict';

	if (! ('WeakMap' in globalThis)) {
		const symbols = {
			keys: Symbol('keys'),
			values: Symbol('values'),
		};

		globalThis.WeakMap = class WeakMap {
			constructor(init) {
				Object.defineProperties(this, {
					[symbols.keys]: {
						enumerable: false,
						configurable: false,
						writable: false,
						value: [],
					},
					[symbols.values]: {
						enumerable: false,
						configurable: false,
						writable: false,
						value: [],
					},
				});

				if (typeof init !== 'undefined' && Symbol.iterator in init) {
					for (const [key, value] of init) {
						this.set(key, value);
					}
				}
			}

			has(key) {
				return this[symbols.keys].includes(key);
			}

			set(key, value) {
				const existing = this[symbols.keys].indexOf(key);

				if (existing !== -1) {
					this[symbols.values][existing] = value;
				} else {
					this[symbols.keys].push(key);
					this[symbols.values].push(value);
				}

				return this;
			}

			get(key) {
				const index = this[symbols.keys].indexOf(key);
				return index === -1 ? undefined : this[symbols.values][index];
			}

			delete(key) {
				const index = this[symbols.keys].indexOf(key);
				if (index === -1) {
					return false;
				} else {
					this[symbols.keys].splice(index, 1);
					this[symbols.values].splice(index, 1);
					return true;
				}
			}
		};
	}

	if (! ('Map' in globalThis)) {
		const symbols = {
			keys: Symbol('keys'),
			values: Symbol('values'),
		};

		globalThis.Map = class Map {
			constructor(init) {
				Object.defineProperties(this, {
					[symbols.keys]: {
						enumerable: false,
						configurable: false,
						writable: true,
						value: [],
					},
					[symbols.values]: {
						enumerable: false,
						configurable: false,
						writable: true,
						value: [],
					},
				});

				if (typeof init !== 'undefined' && Symbol.iterator in init) {
					for (const [key, value] of init) {
						this.set(key, value);
					}
				}
			}

			get size() {
				return this[symbols.keys].length;
			}

			clear() {
				this[symbols.keys] = [];
				this[symbols.values] = [];
			}

			has(key) {
				return this[symbols.keys].includes(key);
			}

			set(key, value) {
				const existing = this[symbols.keys].indexOf(key);

				if (existing !== -1) {
					this[symbols.values][existing] = value;
				} else {
					this[symbols.keys].push(key);
					this[symbols.values].push(value);
				}

				return this;
			}

			get(key) {
				const index = this[symbols.keys].indexOf(key);
				return index === -1 ? undefined : this[symbols.values][index];
			}

			delete(key) {
				const index = this[symbols.keys].indexOf(key);
				if (index === -1) {
					return false;
				} else {
					this[symbols.keys].splice(index, 1);
					this[symbols.values].splice(index, 1);
					return true;
				}
			}

			*keys() {
				for (const key of this[symbols.keys]) {
					yield key;
				}
			}

			*values() {
				for (const value of this[symbols.values]) {
					yield value;
				}
			}

			*entries() {
				for (let n = 0; n < this.size; n++) {
					yield [this[symbols.keys][n], this[symbols.values][n]];
				}
			}

			[Symbol.iterator]() {
				return this.entries();
			}

			forEach(callback, thisArg = globalThis) {
				[...this.entries()].forEach(([key, value]) => callback.call(thisArg, value, key, this));
			}
		};
	}
})();
