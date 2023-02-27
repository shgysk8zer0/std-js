(function() {
	'use strict';

	if (! (Number.range instanceof Function)) {
		/**
		 * @see https://github.com/tc39/proposal-Number.range
		 * @deprecated - changed to `Iterator.range`
		 */
		Number.range = function range(start, end, step = 1) {
			console.warn('`Number.range()` is deprecated. Use `Iterator.range()` instead.');
			return globalThis.Iterator.range(start, end, { step });
		};
	}
})();
