if (! ('AbortSignal' in globalThis)) {
	const symbols = {
		signal: Symbol('signal'),
		aborted: Symbol('aborted'),
	};

	globalThis.AbortError = class AbortError extends Error {};

	globalThis.AbortSignal = class AbortSignal extends EventTarget {
		constructor() {
			super();
			this.onabort = null;
			this[symbols.aborted] = false;

			this.addEventListener('abort', event => {
				if (this.onabort instanceof Function) {
					this.onabort.call(this, event);
				}
			});
		}

		get aborted() {
			return this[symbols.aborted];
		}

		static abort() {
			const signal = new AbortSignal();
			signal[symbols.aborted] = true;
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

		abort() {
			const signal = this.signal;

			if (! signal.aborted) {
				signal[symbols.aborted] = true
				signal.dispatchEvent(new Event('abort'));
			}
		}
	};
}

if (! (AbortSignal.abort instanceof Function)) {
	AbortSignal.abort = function abort() {
		const controller = new AbortController();
		controller.abort();
		return controller.signal;
	};
}
