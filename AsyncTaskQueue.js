import { getDeferred, onIdle, onAnimationFrame, onTimeout, callAsAsync } from './promises.js';
import { isAborted } from './abort.js';

const symbols = {
	resolve: Symbol('resolve'),
	set: Symbol('set'),
	reject: Symbol('reject'),
};

export class AsyncTaskQueue {
	constructor(...callbacks) {
		Object.defineProperty(this, symbols.set, {
			configurable: false,
			enumerable: false,
			writable: false,
			value: new Set(),
		});

		callbacks.filter(callback => callback instanceof Function).forEach(this.add);
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

	clear() {
		if (this.waiting) {
			this[symbols.reject]('Task queue cleared');
			delete this[symbols.resolve];
			delete this[symbols.reject];
		}

		return this[symbols.set].clear();
	}

	forEach(callback, thisArg) {
		return this[symbols.set].forEach(callback, thisArg);
	}

	values() {
		return this[symbols.set].values();
	}

	keys() {
		return this[symbols.set].keys();
	}

	entries() {
		return this[symbols.set].entries();
	}

	[Symbol.iterator]() {
		return this.values();
	}

	add(...callbacks) {
		callbacks.forEach(callback => {
			if (! (callback instanceof Function)) {
				throw new TypeError('Callback must be a function');
			} else if (this.waiting) {
				const resolve = this[symbols.resolve];
				resolve(callback);
				delete this[symbols.resolve];
				delete this[symbols.reject];
			} else {
				this[symbols.set].add(callback);
			}
		});
	}

	has(...callbacks) {
		return callbacks.every(callback => this[symbols.set].has(calback));
	}

	delete(callback) {
		return this[symbols.set].delete(callback);
	}

	async execute({ signal, thisArg = globalThis } = {}) {
		for (const callback of this) {
			if (! isAborted(signal) &&callback instanceof Function) {
				this.delete(callback);
				await callAsAsync(callback, [], { signal, thisArg });
			}
		}
	}

	async executeOnIdle({ signal, thisArg = globalThis, timeout } = {}) {
		for (const callback of this) {
			if (! isAborted(signal) &&callback instanceof Function) {
				this.delete(callback);
				await onIdle(callback, { signal, thisArg, timeout });
			}
		}
	}

	async executeOnAnimationFrame({ signal, thisArg = globalThis } = {}) {
		for (const callback of this) {
			if (! isAborted(signal) &&callback instanceof Function) {
				this.delete(callback);
				await onAnimationFrame(callback, { signal, thisArg });
			}
		}
	}

	async executeOnTimeout({ timeout = 0, signal, thisArg = globalThis } = {}) {
		for (const callback of this) {
			if (! isAborted(signal) &&callback instanceof Function) {
				this.delete(callback);
				await onTimeout(callback, { timeout, signal, thisArg });
			}
		}
	}

	async *getQueue({ signal } = {}) {
		while(! isAborted(signal)) {
			if (this.empty) {
				const { promise, resolve, reject } = getDeferred({ signal });
				Object.defineProperty(this, symbols.resolve, {
					configurable: true,
					writable: false,
					enumerable: false,
					value: resolve,
				});

				Object.defineProperty(this, symbols.reject, {
					configurable: true,
					writable: false,
					enumerable: false,
					value: reject,
				});

				try {
					const callback = await promise;
					yield callback;
				} catch(err) {
					console.error(err);
					return;
				}
			} else {
				for (const callback of this) {
					if (isAborted(signal)) {
						return;
					} else {
						this.delete(callback);
						yield callback;
					}
				}
			}
		}
	}
}
