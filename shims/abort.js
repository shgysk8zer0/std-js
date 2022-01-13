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
