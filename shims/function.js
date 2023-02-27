(function() {
	'use strict';

	if (! (Function.prototype.once instanceof Function)) {
		const funcs = new WeakMap();

		/**
		 * @see https://github.com/tc39/proposal-function-once
		 */
		Function.prototype.once = function once(thisArg) {
			const callback = this;
			return function(...args) {
				if (funcs.has(callback)) {
					return funcs.get(callback);
				} else if (callback.constructor.name === 'AsyncFunction') {
					const retVal = callback.apply(thisArg || callback, args).catch(err => {
						funcs.delete(callback);
						throw err;
					});

					funcs.set(callback, retVal);
					return retVal;
				} else if (callback instanceof Function) {
					const retVal = callback.apply(thisArg || callback, args);
					funcs.set(callback, retVal);
					return retVal;
				}
			};
		};
	}
})();
