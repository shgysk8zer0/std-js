import { getDeferred, onIdle, onAnimationFrame, onTimeout, callAsAsync } from './promises.js';

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
			const resolve = this[symbols.resolve];
			delete this[symbols.resolve];
			resolve(callback);
		} else {
			this[symbols.set].add(callback);
		}
	}

	async execute({ signal, thisArg = globalThis } = {}) {
		for await (const callback of this.getQueue({ signal })) {
			if (callback instanceof Function) {
				await callAsAsync(callback, { signal, thisArg });
			}
		}
	}

	async executeOnIdle({ signal, thisArg = globalThis, timeout } = {}) {
		for await (const callback of this.getQueue({ signal })) {
			if (callback instanceof Function) {
				await onIdle(callback, { signal, thisArg, timeout });
			}
		}
	}

	async executeOnAnimationFrame({ signal, thisArg = globalThis } = {}) {
		for await (const callback of this.getQueue({ signal })) {
			if (callback instanceof Function) {
				await onAnimationFrame(callback, { signal, thisArg });
			}
		}
	}

	async executeOnTimeout({ timeout = 0, signal, thisArg = globalThis } = {}) {
		for await (const callback of this.getQueue({ signal })) {
			if (callback instanceof Function) {
				await onTimeout(callback, { timeout, signal, thisArg });
			}
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
