import { when, ready, beforeInstallPrompt } from './dom.js';
import { signalAborted } from './abort.js';
import { getManifest } from './http.js';
import { listen, onKeypress } from './events.js';
import { checkSupport as locksSupported } from './LockManager.js';
export const infinitPromise = new Promise(() => {});

//export const readyPromise = ready();

//export const loadedPromise = loaded();

export const manifestPromise = new Promise((resolve, reject) => {
	ready().then(() => getManifest()).then(resolve).catch(reject);
});

export const beforeInstallPromptPromise = beforeInstallPrompt();

export function isAsyncFunction(what) {
	return what instanceof Function && what.constructor.name === 'AsyncFunction';
}

export function isAsync(what) {
	return isAsyncFunction(what) || what instanceof  Promise;
}

export function getDeferred({ signal } = {}) {
	const deferred = {};

	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

	if (signal instanceof EventTarget && signal.throwIfAborted instanceof Function) {
		if (signal.aborted) {
			deferred.reject(signal.reason);
		} else {
			signal.addEventListener('abort', ({ target }) => deferred.reject(target.reason), { once: true });
		}
	}

	return Object.seal(deferred);
}

export async function callAsAsync(callback, args = [], { thisArg = globalThis, signal } = {}) {
	const { promise, resolve, reject } = getDeferred({ signal });

	if (! (callback instanceof Function)) {
		reject(new TypeError('`callAsAsync` expects callback to be a function'));
	} else if (! Array.isArray(args)) {
		reject(new TypeError('`args` must be an array'));
	} else if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason);
	} else if (isAsyncFunction(callback)) {
		callback.call(thisArg, args).then(resolve).catch(reject);
	} else {
		queueMicrotask(() => {
			try {
				resolve(callback.call(thisArg, args));
			} catch(err) {
				reject(err);
			}
		});
	}

	return await promise;
}

export async function whenKeypress(key, {
	target = globalThis,
	type = 'keypress',
	capture,
	passive,
	signal,
	altKey,
	ctrlKey,
	metaKey,
	shiftKey,
} = {}) {
	const { resolve, promise } = getDeferred({ signal });
	onKeypress(key, resolve, { target, type, capture, once: true, passive, signal, altKey, ctrlKey, metaKey, shiftKey });
	return await promise;
}

export function createDeferredCallback(callback, { signal, thisArg } = {}) {
	const { promise, resolve } = getDeferred({ signal });
	const retPromise = promise.then(() => callAsAsync(callback, [], { signal, thisArg }));

	return async () => {
		resolve();
		return await retPromise;
	};
}

export async function lock(name, callback, {
	thisArg = globalThis,
	args = [],
	mode = 'exclusive',
	ifAvailable = false,
	steal = false,
	allowFallback = true,
	signal,
} = {}) {
	if ((! allowFallback) || await locksSupported()) {
		return await navigator.locks.request(name, { mode, ifAvailable, steal, signal }, async lock => {
			if (lock) {
				return await callAsAsync(callback, [lock, ...args], { thisArg, signal });
			}
		});
	} else {
		return await callAsAsync(callback, [null, ...args], { signal, thisArg });
	}
}

export async function onAnimationFrame(callback, {
	thisArg = globalThis,
	args = [],
	signal,
} = {}) {
	const { promise, resolve, reject } = getDeferred({ signal });
	const id = requestAnimationFrame(hrts => callAsAsync(callback, [hrts, ...args], { signal, thisArg }).then(resolve, reject));

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => cancelAnimationFrame(id));
	}

	return await promise;
}

export async function onIdle(callback, {
	timeout,
	thisArg = globalThis,
	args = [],
	signal,
} = {}) {
	const { promise, resolve, reject } = getDeferred({ signal });
	const id = requestIdleCallback(hrts => callAsAsync(callback, [hrts, ...args], { thisArg, signal }).then(resolve, reject), { timeout });

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => cancelIdleCallback(id));
	}

	return await promise;
}

export async function onTimeout(callback, {
	timeout = 0,
	thisArg = globalThis,
	args = [],
	signal,
} = {}) {
	const { resolve, reject, promise } = getDeferred({ signal });

	if (Number.isSafeInteger(timeout) && timeout >= 0) {
		const id = setTimeout(() => {
			callAsAsync(callback, args, { signal, thisArg }).then(resolve).catch(reject);
		}, timeout);

		if (signal instanceof AbortSignal) {
			signalAborted(signal).finally(() => clearTimeout(id));
		}
	} else {
		reject(new TypeError('`timeout` must be a positive intege'));
	}

	return await promise;
}

export async function sleep(timeout, { signal } = {}) {
	const { resolve, promise } = getDeferred({ signal });
	onTimeout(() => resolve(performance.now()), { signal, timeout })
		.catch(() => resolve(performance.now()));
	return await promise;
}

export async function promisifyEvents(targets, { success, fail = 'error', passive = true, capture = true } = {}) {
	const controller = new AbortController();
	const opts = { passive, capture, signal: controller.signal, once: true };

	try {
		const events = [];

		if (typeof success === 'string' || Array.isArray(success) && success.length !== 0) {
			events.push(when(targets, success, opts));
		}

		if (typeof fail === 'string' || (Array.isArray(fail) && fail.length !== 0)) {
			events.push(when(targets, fail, opts).then(event => Promise.reject(event)));
		}

		const result = await Promise.race(events);

		controller.abort();
		return result;
	} catch(err) {
		controller.abort();
		throw err;
	}
}

export async function *promiseQueue(...promises) {
	const target = new EventTarget();
	const queue = new Set(promises);
	const results = [];

	promises.forEach(prom => prom.then(result => {
		results.push(result);
		queue.delete(prom);
		target.dispatchEvent(new Event('resolve'));
	}));

	while (queue.size !== 0 || results.length !== 0) {
		if (results.length === 0) {
			await resolveOn(target, 'resolve');
		}

		yield results.shift();
	}
}

export async function resolveOn(targets, success, { passive = true, capture = true } = {}) {
	return await promisifyEvents(targets, { success, fail: null,  passive, capture });
}

export async function rejectOn(targets, fail, { passive = true, capture = true } = {}) {
	return await promisifyEvents(targets, { success: null, fail,  passive, capture });
}

export async function abortablePromise(promise, signal) {
	return await Promise.race([promise, signalAborted(signal)]);
}

export async function *eventGenerator(target, event, { signal, capture, passive } = {}) {
	const { callback, generator } = callbackGenerator();
	listen(target, event, callback, { signal, capture, passive });

	if (! (signal instanceof AbortSignal)) {
		for await (const result of generator()) {
			yield await result;
		}
	} else if (signal.aborted) {
		return;
	} else {
		for await (const result of generator({ signal })) {
			yield await result;
		}
	}
}

export function callbackGenerator() {
	const target = new EventTarget();
	const queue = [];

	async function *generator({ signal } = {}) {
		if (signal instanceof AbortSignal) {
			while (! signal.aborted) {
				if (queue.length === 0) {
					await Promise.race([
						when(target, 'update', { signal }),
						signalAborted(signal).catch(() => null).finally(() => null),
					]).catch(() => null);
				}

				yield queue.shift();
			}
		} else {
			while (true) {
				if (queue.length === 0) {
					await when(target, 'update', { signal });
				}

				yield queue.shift();
			}
		}
	}

	const callback = (...args) => {
		queue.push(...args);
		target.dispatchEvent(new Event('update'));
	};

	return { callback, generator };
}
