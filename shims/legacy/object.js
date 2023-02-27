(function() {
	'use strict';

	if (! (Object.hasOwn instanceof Function)) {
		Object.hasOwn = function hasOwn(obj, prop) {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		};
	}

	if (! (Object.keys instanceof Function)) {
		Object.keys = function keys(obj) {
			const arr = [];

			for (const k in obj) {
				arr.push(k);
			}

			return arr;
		};
	}

	if (! (Object.values instanceof Function)) {
		Object.values = obj => Object.keys(obj).map(k => obj[k]);
	}

	if (! (Object.entries instanceof Function)) {
		Object.entries = obj => Object.keys(obj).map(k => [k, obj[k]]);
	}

	if (! (Object.fromEntries instanceof Function)) {
		Object.fromEntries = function(arr) {
			if (Array.isArray(arr)) {
				return arr.reduce((obj, [key, val]) => {
					obj[key] = val;
					return obj;
				}, {});
			} else {
				return Object.fromEntries(Array.from(arr));
			}
		};
	}
})();
