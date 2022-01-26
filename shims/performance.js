if (! (globalThis.requestIdleCallback instanceof Function)) {
	globalThis.requestIdleCallback = function(callback, { timeout = 50 } = {}) {
		const now = Date.now();

		return requestAnimationFrame(function() {
			const idle = {
				timeRemaining: function() {
					return Math.max(0, timeout - (Date.now() - now));
				}
			};

			idle.didTimeout = idle.timeRemaining() === 0;

			callback(idle);
		});
	};
}

if (! ( globalThis.cancelIdleCallback instanceof Function)) {
	globalThis.cancelIdleCallback = function(id) {
		cancelAnimationFrame(id);
	};
}

if (! (globalThis.queueMicrotask instanceof Function)) {
	globalThis.queueMicrotask = cb => Promise.resolve().then(cb)
		.catch(e => setTimeout(() => { throw e; }));
}
