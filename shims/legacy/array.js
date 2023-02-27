(function() {
	'use strict';

	if (! (Array.from instanceof Function)) {
		Array.from = function from(iter) {
			return Array.of(...iter);
		};
	}

	if (! (Array.of instanceof Function)) {
		Array.of = function of(...items) {
			return items;
		};
	}
})();
