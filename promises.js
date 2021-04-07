import { when, on } from './dom.js';
import { signalAborted } from './abort.js';

export const infinitPromise = new Promise(() => {});

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
	await Promise.race([
		new Promise(resolve => setTimeout(() => resolve(), ms)),
		signalAborted(signal).then(() => null)
	]).finally(() => null);
}

export function getDeferred({ signal } = {}) {
	const deferred = {};

	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

	if (signal instanceof AbortSignal) {
		signal.addEventListener('abort', () => deferred.reject('Operation aborted.'));
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

	async function *generator({ signal } = { aborted: false }) {
		while (! signal.aborted) {
			if (queue.length === 0) {
				await Promise.race([
					when(target, 'update', { signal }),
					signalAborted(signal).catch(() => null).finally(() => null),
				]).catch(() => null);
			} else {
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
