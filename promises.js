import { when, on } from './dom.js';
import { signalAborted } from './abort.js';

export function isAsync(what) {
	return what instanceof  Promise || what instanceof Function && what.constructor.name === 'AsyncFunction';
}

export const infinitPromise = new Promise(() => {});

export async function onAnimationFrame(callback, { signal, reason = 'Operation aborted.' } = {}) {
	const { promise, resolve, reject } = getDeferred();

	const id = requestAnimationFrame(hrts => {
		if (! (callback instanceof Function)) {
			reject(new TypeError('callback must be an instance of Function'));
		} else if (callback.constructor.name === 'AsyncFunction') {
			callback(hrts).then(resolve).catch(reject);
		} else {
			try {
				resolve(callback(hrts));
			} catch (err) {
				reject(err);
			}
		}
	});

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => {
			cancelAnimationFrame(id);
			reject(reason);
		});
	}

	return await promise;
}

export async function onIdle(callback, { timeout, signal, reason = 'Operation aborted.' } = {}) {
	const { promise, resolve, reject } = getDeferred();

	const id = requestIdleCallback(async hrts => {
		if (! (callback instanceof Function)) {
			reject(new TypeError('callback must be an instance of Function'));
		} else if (callback.constructor.name === 'AsyncFunction') {
			callback(hrts).then(resolve).catch(reject);
		} else {
			try {
				resolve(callback(hrts));
			} catch (err) {
				reject(err);
			}
		}
	}, { timeout });

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => {
			cancelIdleCallback(id);
			reject(reason);
		});
	}

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

export async function abortablePromise(promise, signal, { reason } = {}) {
	return await Promise.race([promise, signalAborted(signal, { reason })]);
}

export async function sleep(ms, { signal } = {}) {
	if (! Number.isSafeInteger(ms) || ms < 0) {
		throw new TypeError('`sleep()` only accepts positive integers (ms)');
	} else {
		const { resolve, promise } = getDeferred({ signal });
		const timeout = setTimeout(() => resolve(), ms);

		return await promise.catch(err => {
			clearTimeout(timeout);
			throw err;
		});
	}
}

export function getDeferred({ signal, reason = new DOMException('Operation aborted') } = {}) {
	const deferred = {};

	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

	if (signal instanceof EventTarget) {
		if (signal.aborted) {
			deferred.reject(reason);
		} else {
			signal.addEventListener('abort', () => deferred.reject(reason), { once: true });
		}
	}

	return Object.seal(deferred);
}

export async function *eventGenerator(target, event, { signal, capture, passive } = {}) {
	const{ callback, generator } = callbackGenerator();
	on(target, event, callback, { signal, capture, passive });

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
