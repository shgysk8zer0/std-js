import { errorToEvent } from '../dom.js';

if (! globalThis.hasOwnProperty('AggregateError')) {
	globalThis.AggregateError = class AggregateError extends Error {
		constructor(errors, message) {
			if (typeof message === 'undefined') {
				super(errors);
				this.errors = [];
			} else {
				super(message);
				this.errors = errors;
			}
		}
	};
}

if (! (globalThis.reportError instanceof Function)) {
	globalThis.reportError = function reportError(error) {
		globalThis.dispatchEvent(errorToEvent(error));
	};
}
