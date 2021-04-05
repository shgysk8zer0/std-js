import { when } from './dom.js';
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

export async function resolveOn(targets, success, { passive = true, capture = true } = {}) {
	return await promisifyEvents(targets, { success, fail: null,  passive, capture });
}

export async function rejectOn(targets, fail, { passive = true, capture = true } = {}) {
	return await promisifyEvents(targets, { success: null, fail,  passive, capture });
}

export async function abortablePromise(promise, signal, { reason } = {}) {
	return await Promise.race([promise, signalAborted(signal, { reason })]);
}

export function getDeferred() {
	const deferred = {};

	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

	return Object.seal(deferred);
}
