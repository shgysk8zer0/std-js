(function() {
	'use strict';

	if (! Number.hasOwnProperty('isSafeInteger')) {
		Number.MAX_SAFE_INTEGER = 2**53 -1;
		Number.MIN_SAFE_INTEGER = -Number.MAX_SAFE_INTEGER;
		Number.isSafeInteger = num => num <= Number.MAX_SAFE_INTEGER && num >= Number.MIN_SAFE_INTEGER;
	}

	if (! Number.hasOwnProperty('EPSILON')) {
		Number.EPSILON = 2**-52;
	}

	if (! Math.hasOwnProperty('sign')) {
		Math.sign = x => ((x > 0) - (x < 0)) || +x;
	}

	if (! Math.hasOwnProperty('trunc')) {
		Math.trunc = x => {
			const n = x - x%1;
			return n===0 && (x<0 || (x===0 && (1/x !== 1/0))) ? -0 : n;
		};
	}

	if (! Math.hasOwnProperty('expm1')) {
		Math.expm1 = x => Math.exp(x) - 1;
	}

	if (! Math.hasOwnProperty('hypot')) {
		Math.hypot = (...nums) => Math.sqrt(nums.reduce((sum, num) => sum +  num**2, 0));
	}

	if (! Math.hasOwnProperty('cbrt')) {
		Math.cbrt = x => x**(1/3);
	}

	if (! Math.hasOwnProperty('log10')) {
		Math.log10 = x => Math.log(x) * Math.LOG10E;
	}

	if (! Math.hasOwnProperty('log2')) {
		Math.log2 = x => Math.log(x) * Math.LOG2E;
	}

	if (! Math.hasOwnProperty('log1p')) {
		Math.log1p = x => Math.log(1 + x);
	}

	if (! Math.hasOwnProperty('fround')) {
		Math.fround = (function (array) {
			return function(x) {
				return array[0] = x, array[0];
			};
		})(new Float32Array(1));
	}

	if (! (Math.clamp instanceof Function)) {
		Math.clamp = function(value, min, max) {
			return Math.min(Math.max(value, min), max);
		};
	}

	/*
	 * Question of if it will be `Math.clamp` or `Math.constrain`
	 */
	if (! (Math.constrain instanceof Function)) {
		Math.constrain = Math.clamp;
	}
})();
