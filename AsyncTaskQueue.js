import { getDeferred } from './promises.js';

const symbols = {
	resolve: Symbol('resolve'),
	set: Symbol('set')
};

export class AsyncTaskQueue {
	constructor() {
		Object.defineProperty(this, symbols.set, {
			configurable: false,
			enumerable: false,
			writable: false,
			value: new Set(),
		 });
	}

	get size() {
		return this[symbols.set].size;
	}

	get empty() {
		return this.size === 0;
	}

	get waiting() {
		return this.hasOwnProperty(symbols.resolve);
	}

	add(callback) {
		if (! (callback instanceof Function)) {
			throw new TypeError('Callback must be a function');
		} else if (this.waiting) {
			this[symbols.resolve](callback);
			delete this[symbols.resolve];
		} else {
			this[symbols.set].add(callback);
		}
	}

	async *getQueue({ signal } = {}) {
		while(! (signal instanceof AbortSignal && signal.aborted)) {
			if (this.empty) {
				const { promise, resolve } = getDeferred({ signal });
				Object.defineProperty(this, symbols.resolve, {
					configurable: true,
					writable: false,
					enumerable: false,
					value: resolve,
				});

				try {
					const callback = await promise;
					yield callback;
				} catch(err) {
					console.error(err);
					return;
				}
			} else {
				for (const callback of this[symbols.set]) {
					if (signal instanceof AbortSignal && signal.aborted) {
						return;
					} else {
						this[symbols.set].delete(callback);
						yield callback;
					}
				}
			}
		}
	}
}