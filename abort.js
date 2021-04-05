import './abort-shims.js';
import { when } from './dom.js';
import { features as eventFeatures} from './events.js';

export const nativeSupport = eventFeatures.nativeSignal;
export const infinitPromise = new Promise(() => {});

export async function signalAborted(signal) {
	if (! (signal instanceof AbortSignal)) {
		return infinitPromise;
	} else if (signal.aborted) {
		return Promise.reject();
	} else {
		return rejectOn(signal, 'abort');
	}
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

export async function resolveOn(targets, success, { passive = true, capture = true } = {}) {
	return await promisifyEvents(targets, { success, fail: null,  passive, capture });
}

export async function rejectOn(targets, fail, { passive = true, capture = true } = {}) {
	return await promisifyEvents(targets, { success: null, fail,  passive, capture });
}

export async function abortablePromise(promise, signal) {
	return await Promise.race([promise, signalAborted(signal)]);
}

export function abortTimeoutController(timeout) {
	const controller = new AbortController();
	setTimeout(() => controller.abort(), timeout);
	return controller;
}

export function abortEventController(what, events, { passive, capture } = {}) {
	const controller = new AbortController();

	when(what, events, { signal: controller.signal, capture, passive }).then(() => {
		if (! controller.signal.aborted) {
			controller.abort();
		}
	});

	return controller;
}

export function multiSignalController(...signals) {
	const controller = new AbortController();

	for (const signal of signals) {
		if (signal instanceof AbortSignal) {
			if (signal.aborted) {
				controller.abort();
				break;
			} else {
				signal.addEventListener('abort', () => controller.abort(), { signal: controller.signal });
			}
		} else if (signal instanceof AbortController) {
			if (signal.signal.aborted) {
				controller.abort();
				break;
			} else {
				signal.signal.addEventListener('abort', () => controller.abort(), { signal: controller.signal });
			}
		} else {
			controller.abort();
			throw new TypeError('multiSignalController only accepts AbortSignals');
		}
	}

	return controller;
}
