(function() {
	'use strict';

	/**
	 * @see https://github.com/tc39/proposal-set-methods
	 */

	if (! (Set.prototype.intersection instanceof Function)) {
		Set.prototype.intersection = function intersection(iterable) {
			if (! (iterable instanceof Set)) {
				iterable = new Set(iterable);
			}

			return new Set([...this].filter(item => iterable.has(item)));
		};
	}

	if (! (Set.prototype.difference instanceof Function)) {
		Set.prototype.difference = function difference(iterable) {
			if (! (iterable instanceof Set)) {
				iterable = new Set(iterable);
			}

			return new Set([...this].filter(item => ! iterable.has(item)));
		};
	}

	if (! (Set.prototype.union instanceof Function)) {
		Set.prototype.union = function union(iterable) {
			return new Set([...this, ...iterable]);
		};
	}

	if (! (Set.prototype.isSubsetOf instanceof Function)) {
		Set.prototype.isSubsetOf = function isSubsetOf(iterable) {
			if (! (iterable instanceof Set)) {
				iterable = new Set(iterable);
			}

			return [...this].every(item => iterable.has(item));
		};
	}

	if (! (Set.prototype.isSupersetOf instanceof Function)) {
		Set.prototype.isSupersetOf = function isSupersetOf(iterable) {
			if (! (iterable instanceof Set)) {
				iterable = new Set(iterable);
			}

			return iterable.isSubsetOf(this);
		};
	}

	if (! (Set.prototype.symmetricDifference instanceof Function)) {
		Set.prototype.symmetricDifference = function symmetricDifference(iterable) {
			if (! (iterable instanceof Set)) {
				iterable = new Set(iterable);
			}

			return new Set([...this.difference(iterable), ...iterable.difference(this)]);
		};
	}

	if (! (Set.prototype.isDisjointFrom instanceof Function)) {
		Set.prototype.isDisjointFrom = function isDisjointFrom(iterable) {
			if (! (iterable instanceof Set)) {
				iterable = new Set(iterable);
			}

			return new Set([...this, ...iterable]).size === this.size + iterable.size;
		};
	}
})();
