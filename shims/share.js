(function() {
	'use strict';

	if (! (navigator.canShare instanceof Function)) {
		navigator.canShare = function({ title, text, url, files } = {}) {
			if (! (navigator.share instanceof Function)) {
				return false;
			} else if (Array.isArray(files) && files.length !== 0) {
				return false;
			} else if ([title, text, url].every(arg => typeof arg === 'undefined')) {
				return true;
			} else {
				return [title, text, url].some(arg => typeof arg === 'string' && arg.length !== 0);
			}
		};
	}
})();
