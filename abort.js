import './abort-shims.js';
import { when } from './dom.js';
import { features as eventFeatures} from './events.js';
import { rejectOn, infinitPromise } from './promises.js';

export const nativeSupport = eventFeatures.nativeSignal;

export async function signalAborted(signal, { reason } = {}) {
	if (signal instanceof AbortController) {
		return await signalAborted(signal.signal, { reason });
	} else if (! (signal instanceof AbortSignal)) {
		return infinitPromise;
	} else if (signal.aborted) {
		return Promise.reject(reason);
	} else {
		return rejectOn(signal, 'abort').catch(() => Promise.reject(reason));
	}
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
