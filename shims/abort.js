(function() {
	'use strict';

	if (! ('AbortSignal' in globalThis)) {
		const symbols = {
			signal: Symbol('signal'),
			aborted: Symbol('aborted'),
			reason: Symbol('reason'),
			onabort: Symbol('onabort'),
		};

		globalThis.AbortError = class AbortError extends Error {};

		globalThis.AbortSignal = class AbortSignal extends EventTarget {
			constructor() {
				super();

				Object.defineProperties(this,{
					[symbols.aborted]: {
						enumerable: false,
						writable: true,
						configurable: false,
						value: false,
					},
					[symbols.reason]: {
						enumerable: false,
						writable: true,
						configurable: false,
						value: undefined,
					},
					[symbols.onabort]: {
						enumerable: false,
						writable: true,
						configurable: false,
						value: null,
					},
				});

				this.addEventListener('abort', event => {
					if (this.onabort instanceof Function) {
						this.onabort.call(this, event);
					}
				});
			}

			get aborted() {
				return this[symbols.aborted];
			}

			get onabort() {
				return this[symbols.onabort];
			}

			set onabort(value) {
				if (value instanceof Function) {
					this[symbols.onabort] = value;
				} else {
					this[symbols.onabort] = null;
				}
			}

			get reason() {
				return this[symbols.reason];
			}

			throwIfAborted() {
				if (this.aborted) {
					throw this.reason;
				}
			}

			static abort(reason = new DOMException('Operation aborted')) {
				const signal = new AbortSignal();
				signal[symbols.aborted] = true;
				signal[symbols.reason] = reason;
				return signal;
			}
		};

		globalThis.AbortController = class AbortController {
			constructor() {
				this[symbols.signal] = new AbortSignal();
			}

			get signal() {
				return this[symbols.signal];
			}

			abort(reason = new DOMException('Operation aborted')) {
				const signal = this.signal;

				if (! signal.aborted) {
					signal[symbols.aborted] = true;
					signal[symbols.reason] = reason;
					signal.dispatchEvent(new Event('abort'));
				}
			}
		};
	}

	if (! ('reason' in AbortSignal.prototype)) {
		const reasons = new WeakMap();
		const abort = AbortController.prototype.abort;

		if (AbortSignal.abort instanceof Function) {
			const staticAbort = AbortSignal.abort;

			AbortSignal.abort = function(reason = new DOMException('Operation aborted')) {
				const signal = staticAbort();
				reasons.set(signal, reason);
				return signal;
			};
		} else {
			AbortSignal.abort = function abort(reason = new DOMException('Operation aborted')) {
				const controller = new AbortController();
				controller.abort(reason);
				return controller.reason;
			};
		}

		Object.defineProperty(AbortSignal.prototype, 'reason', {
			enumerable: true,
			configurable: true,
			get: function() {
				if (reasons.has(this)) {
					return reasons.get(this);
				} else {
					return undefined;
				}
			}
		});

		AbortController.prototype.abort = function(reason = new DOMException('Operation aborted')) {
			reasons.set(this.signal, reason);
			abort.call(this);
		};
	}

	if (! (AbortSignal.prototype.throwIfAborted instanceof Function)) {
		AbortSignal.prototype.throwIfAborted = function() {
			if (this.aborted) {
				throw this.reason;
			}
		};
	}

	if (! (AbortSignal.timeout instanceof Function)) {
		AbortSignal.timeout = function(ms) {
			if (typeof ms === 'undefined') {
				throw new TypeError('At least one 1 argument required but only 0 passed');
			} else if (! Number.isFinite(ms)) {
				throw new TypeError('Argument 1 is not a finite value, so it is out of range for unsigned long long.');
			} else if (ms < 0) {
				throw new TypeError('Argument 1 is out of range for unsigned long long.');
			} else {
				const controller = new AbortController();
				setTimeout(() => controller.abort(new DOMException('The operation timed out.')), ms);
				return controller.signal;
			}
		};
	}

	/**
	 * @see https://chromestatus.com/feature/5202879349522432
	 * @TODO How do I handle if a signal is already aborted
	 * @TODO Should controller abort on a TypeError
	 */
	if (! (AbortSignal.any instanceof Function)) {
		AbortSignal.any = function(signals) {
			if (! Array.isArray(signals)) {
				throw new TypeError('Expected an array of signals');
			}

			const controller = new AbortController();

			for (const signal of signals) {
				if (! (signal instanceof AbortSignal)) {
					const err = new TypeError('`signal` is not an `AbortSignal`');
					controller.abort(err);
					throw err;
				} else if (signal.aborted) {
					controller.abort(signal.reason || new DOMException('Operation aborted.'));
					break;
				} else {
					signal.addEventListener('abort', ({ target }) => {
						controller.abort(target.reason || new DOMException('Operation aborted.'));
					}, { signal: controller.signal });
				}
			}

			return controller.signal;
		};
	}
})();
