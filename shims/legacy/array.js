(function() {

})();
if (! (Array.from instanceof Function)) {
	Array.from = function from(iter) {
		'use strict';
		return Array.of(...iter);
	};
}

if (! (Array.of instanceof Function)) {
	Array.of = function of(...items) {
		'use strict';
		return items;
	};
}
