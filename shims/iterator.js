(function() {
	'use strict';

	/**
	 * @see https://github.com/tc39/proposal-iterator-helpers
	 * @TODO implement `flat()`
	 * @TODO implement `flatMap()`
	 * @TODO implement `from()`
	 */
	if (! ('Iterator' in globalThis)) {
		globalThis.Iterator = {
			'prototype': Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())),
		};
	}

	const Iterator = globalThis.Iterator;

	if (! (Iterator.range instanceof Function)) {
		Iterator.range = function* range(start, end, option) {
			if (typeof option === 'number' || typeof option === 'bigint') {
				for (const n of Iterator.range(start, end, { step: option })) {
					yield n;
				}
			} else if (typeof option !== 'object' || Object.is(option, null)) {
				for (const n of Iterator.range(start, end, {})) {
					yield n;
				}
			} else {
				const {
					// Default to +/-, Number/BigInt based on start & end
					step = typeof start === 'number'
						? start < end ? 1 : -1
						: start < end ? 1n : -1n,
					inclusive = false,
				} = option;

				if (typeof start !== 'number' && typeof start !== 'bigint') {
					throw new TypeError('Start must be a number');
				} else if (Number.isNaN(start)) {
					throw new RangeError('Invalid start');
				} else if (typeof end !== 'number' && typeof end !== 'bigint') {
					throw new TypeError('End must be a number');
				} else if (Number.isNaN(end)) {
					throw new RangeError('Invalid end');
				} else if (typeof step !== 'number' && typeof step !== 'bigint') {
					throw new TypeError('Step must be a number');
				} else if (Number.isNaN(step)) {
					throw new RangeError('Invalid step');
				} else if (step === 0) {
					throw new RangeError('Step must not be 0');
				} else if ((step < 0 && start < end) || (step > 0 && start > end)) {
					return;
				} else if (inclusive) {
					if (step > 0) {
						for (let n = start; n <= end; n+= step) {
							yield n;
						}
					} else {
						for (let n = start; n >= end; n+= step) {
							yield n;
						}
					}
				} else {
					if (step > 0) {
						for (let n = start; n < end; n+= step) {
							yield n;
						}
					} else {
						for (let n = start; n > end; n+= step) {
							yield n;
						}
					}
				}
			}
		};
	}

	if (! (Iterator.prototype[Symbol.toStringTag])) {
		Iterator.prototype[Symbol.toStringTag] = 'Iterator';
	}

	if (! (Iterator.prototype.take instanceof Function)) {
		Iterator.prototype.take = function* take(limit) {
			let n = 0;

			for (const item of this) {
				if (++n > limit) {
					break;
				} else {
					yield item;
				}
			}
		};
	}

	if (! (Iterator.prototype.drop instanceof Function)) {
		Iterator.prototype.drop = function* drop(limit) {
			let n = 0;
			for (const item of this) {
				if (n++ >= limit) {
					yield item;
				}
			}
		};
	}

	if (! (Iterator.prototype.toArray instanceof Function)) {
		Iterator.prototype.toArray = function toArray() {
			return Array.from(this);
		};
	}

	if (! (Iterator.prototype.forEach instanceof Function)) {
		Iterator.prototype.forEach = function forEach(callback) {
			for (const item of this) {
				callback(item);
			}
		};
	}

	if (! (Iterator.prototype.map instanceof Function)) {
		Iterator.prototype.map = function* map(callback) {
			for (const item of this) {
				yield callback(item);
			}
		};
	}

	if (! (Iterator.prototype.reduce instanceof Function)) {
		Iterator.prototype.reduce = function reduce(callback, initialValue) {
			let current = typeof initialValue === 'undefined' ? this.next().value : initialValue;

			for (const item of this) {
				current = callback(current, item);
			}

			return current;
		};
	}

	if (! (Iterator.prototype.filter instanceof Function)) {
		Iterator.prototype.filter = function* filter(callback) {
			for (const item of this) {
				if (callback(item)) {
					yield item;
				}
			}
		};
	}

	if (! (Iterator.prototype.some instanceof Function)) {
		Iterator.prototype.some = function some(callback) {
			let retVal = false;
			for (const item of this) {
				if (callback(item)) {
					retVal = true;
					break;
				}
			}

			return retVal;
		};
	}

	if (! (Iterator.prototype.every instanceof Function)) {
		Iterator.prototype.every = function every(callback) {
			let retVal = true;
			for (const item of this) {
				if (! callback(item)) {
					retVal = false;
					break;
				}
			}

			return retVal;
		};
	}

	if (! (Iterator.prototype.find instanceof Function)) {
		Iterator.prototype.find = function find(callback) {
			for (const item of this) {
				if (callback(item)) {
					return item;
				}
			}
		};
	}

	if (! (Iterator.prototype.indexed instanceof Function)) {
		Iterator.prototype.indexed = function* indexed() {
			let n = 0;
			for (const item of this) {
				yield [n++, item];
			}
		};
	}
})();
