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
		const { message, name, fileName: filename, lineNumber: lineno, columnNumber: colno } = error;
		globalThis.dispatchEvent(new ErrorEvent('error', { error, message: `${name}: ${message}`, filename, lineno, colno }));
	};
}
