(function() {
	'use strict';

	if ('Promise' in globalThis && ! (Promise.prototype.finally instanceof Function)) {
		Promise.prototype.finally = function(callback) {
			return this.then(async val => {
				await callback();
				return val;
			}, async val => {
				await callback();
				return val;
			});
		};
	}

	if ('Promise' in globalThis && ! (Promise.allSettled instanceof Function)) {
		Promise.allSettled = function(promises) {
			return Promise.all(Array.from(promises).map(function(call) {
				return new Promise(function(resolve) {
					if (! (call instanceof Promise)) {
						call = Promise.resolve(call);
					}
					call.then(function(value) {
						resolve({ status: 'fulfilled', value: value });
					}).catch(function(reason) {
						resolve({ status: 'rejected', reason: reason });
					});
				});
			}));
		};
	}

	if ('Promise' in globalThis && ! (Promise.any instanceof Function)) {
		Promise.any = (promises) => new Promise((resolve, reject) => {
			let errors = [];

			promises.forEach(promise => {
				promise.then(resolve).catch(e => {
					errors.push(e);
					if (errors.length === promises.length) {
						reject(new globalThis.AggregateError(errors, 'No Promise in Promise.any was resolved'));
					}
				});
			});
		});
	}

	if ('Promise' in globalThis && ! (Promise.race instanceof Function)) {
		Promise.race = (promises) => new Promise((resolve, reject) => {
			promises.forEach(promise => promise.then(resolve, reject));
		});
	}

	if ('Promise' in globalThis && ! (Promise.try instanceof Function)) {
		/**
		 * @see https://github.com/tc39/proposal-promise-try
		 */
		Promise.try = callback => new Promise(resolve => resolve(callback()));
	}

	if ('Promise' in globalThis && ! (Promise.withResolvers instanceof Function)) {
		Promise.withResolvers = function() {
			const obj = {};

			obj.promise = new Promise((resolve, reject) => {
				obj.resolve = resolve;
				obj.reject = reject;
			});

			return Object.seal(obj);
		};
	}
})();
