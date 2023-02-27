(function() {
	'use strict';

	if (! (globalThis.requestIdleCallback instanceof Function)) {
		const isValidTimeout = timeout => Number.isSafeInteger(timeout) && timeout > 0;

		globalThis.requestIdleCallback = function(callback, { timeout } = {}) {
			const start = performance.now();
			const timeRemaining = () => isValidTimeout(timeout)
				? Math.max(0, timeout - (performance.now() - start))
				: Math.max(0, 600 - (performance.now() - start));

			return setTimeout(() => callback({
				didTimeout: isValidTimeout(timeout) ? timeRemaining() === 0 : false,
				timeRemaining,
			}), 1);
		};
	}

	if (! (globalThis.cancelIdleCallback instanceof Function)) {
		globalThis.cancelIdleCallback = id => clearTimeout(id);
	}

	if (! (globalThis.requestAnimationFrame instanceof Function)) {
		globalThis.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 1000 / 60);
	}

	if (! (globalThis.cancelAnimationFrame instanceof Function)) {
		globalThis.cancelAnimationFrame = id => clearTimeout(id);
	}

	if (! (globalThis.queueMicrotask instanceof Function)) {
		globalThis.queueMicrotask = cb => Promise.resolve().then(cb)
			.catch(e => setTimeout(() => { throw e; }));
	}
})();
