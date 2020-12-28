'use strict';

for (const method in console) {
	if (console[method] instanceof Function) {
		console[method] = () => {};
	}
}
