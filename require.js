import { require, define } from './require-module.js';

(function(global) {
	if (! (global.require instanceof Function)) {
		global.require = require;
	}

	if (! (global.define instanceof Function)) {
		global.define = define;
	}
})(globalThis);
