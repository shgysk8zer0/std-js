if (! ('AbortSignal' in window)) {
	window.AbortError = class AbortError extends Error {};

	window.AbortSignal = class AbortSignal extends EventTarget {
		constructor() {
			super();
			this.onabort = null;
			this._aborted = false;

			this.addEventListener('abort', () => {
				if (this.onabort instanceof Function) {
					this.onabort();
				}
			});
		}

		get aborted() {
			return this._aborted;
		}
	};

	window.AbortController = class AbortController {
		constructor() {
			this._signal = new AbortSignal();
		}

		get signal() {
			return this._signal;
		}

		abort() {
			this._signal._aborted = true;
			this._signal.dispatchEvent(new Event('abort'));
		}
	};
}
