if (! (Function.prototype.once instanceof Function)) {
	const funcs = new WeakMap();

	/**
	 * @see https://github.com/tc39/proposal-function-once
	 */
	Function.prototype.once = function once(thisArg) {
		const callback = (...args) => {
			if (funcs.has(callback)) {
				return funcs.get(callback);
			} else {
				const retVal = this.apply(thisArg || this, args);
				funcs.set(callback, retVal);
				return retVal;
			}
		};

		return callback;
	};
}
