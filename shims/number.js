if (! (Number.range instanceof Function)) {
	/**
	 * @see https://github.com/tc39/proposal-Number.range
	 */
	Number.range = function* range(start, end, step = 1) {
		if (! [start, end, step].every(n => ! Number.isNaN(n) && (Number.isInteger(n) || n === Infinity))) {
			throw new TypeError('`start`, `end`, and `step` must all be integers.');
		} else if (step === 0 || start === end || (start > end && step > 1) || (start < end && step < 1)) {
			throw new RangeError(`Invalid range: {"start": ${start}, "end": ${end}, "step": ${step}}`);
		} else if (step > 0) {
			for (let n = start; n <= end; n += step) {
				yield n;
			}
		} else {
			for (let n = start;n >= end; n += step) {
				yield n;
			}
		}
	};
}
