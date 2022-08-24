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
