if (! ('AbortSignal' in globalThis)) {
	const protectedData = new WeakMap();
	globalThis.AbortError = class AbortError extends Error {};

	globalThis.AbortSignal = class AbortSignal extends EventTarget {
		constructor() {
			super();
			this.onabort = null;
			protectedData.set(this, { aborted: false });

			this.addEventListener('abort', event => {
				if (this.onabort instanceof Function) {
					this.onabort.call(this, event);
				}
			});
		}

		get aborted() {
			return protectedData.get(this).aborted;
		}
	};

	globalThis.AbortController = class AbortController {
		constructor() {
			protectedData.set(this, { signal: new AbortSignal() });
		}

		get signal() {
			return protectedData.get(this).signal;
		}

		abort() {
			const signal = this.signal;
			protectedData.set(signal, { aborted: true });
			signal.dispatchEvent(new Event('abort'));
		}
	};
}
