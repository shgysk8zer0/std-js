(function() {
	'use strict';

	if (! (navigator.setAppBadge instanceof Function)) {
		navigator.setAppBadge = async (n) => {
			if (! Number.isInteger(n)) {
				throw new TypeError('Failed to execute \'setAppBadge\' on \'Navigator\': Value is not of type \'unsigned long long\'');
			} else if (n < 0) {
				throw new TypeError('Failed to execute \'setAppBadge\' on \'Navigator\': Value is outside the \'unsigned long long\' value range.');
			} else if (n === 0) {
				if (document.title.startsWith('(')) {
					document.title = document.title.replace(/^\((\d{1,2}\+?)\)\s/, '');
				}
			} else if (n < 100) {
				await navigator.clearAppBadge();
				document.title = `(${n}) ${document.title}`;
			} else {
				await navigator.clearAppBadge();
				document.title = `(99+) ${document.title}`;
			}
		};
	}

	if (! (navigator.clearAppBadge instanceof Function)) {
		navigator.clearAppBadge = () => navigator.setAppBadge(0);
	}
})();
