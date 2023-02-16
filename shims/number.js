if (! (Number.range instanceof Function)) {
	/**
	 * @see https://github.com/tc39/proposal-Number.range
	 * @deprecated - changed to `Iterator.range`
	 */
	Number.range = function* range(start, end, step = 1) {
		if (! [start, end, step].every(n => typeof n === 'number' && ! Number.isNaN(n))) {
			throw new TypeError('`start`, `end`, and `step` must all be numbers.');
		} else if (step === 0) {
			throw new RangeError(`Invalid step: ${step}`);
		} else if (step > 0) {
			for (let n = start; n <= end; n += step) {
				yield n;
			}
		} else {
			for (let n = start; n >= end; n += step) {
				yield n;
			}
		}
	};
}
