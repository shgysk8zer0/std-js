import './abort-shims.js';
import { when } from './dom.js';
import { features as eventFeatures} from './events.js';
import { resolveOn, infinitPromise } from './promises.js';
export const nativeSupport = eventFeatures.nativeSignal;

export async function signalAborted(signal, { reason } = {}) {
	if (signal instanceof AbortController) {
		return await signalAborted(signal.signal, { reason });
	} else if (! (signal instanceof AbortSignal)) {
		return infinitPromise;
	} else if (signal.aborted) {
		return typeof reason === 'undefined' ? Promise.resolve() : Promise.reject(reason);
	} else {
		return resolveOn(signal, 'abort').finally(() => {
			return typeof reason === 'undefined' ? Promise.resolve() : Promise.reject(reason);
		});
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

export function abortableTimeout(callback, ms, { signal } = {}) {
	const id = setTimeout(() => callback(), ms);
	signalAborted(signal).finally(() => clearTimeout(id));
	return id;
}

export function abortableInterval(callback, ms, { signal } = {}) {
	const id = setInterval(() => callback(), ms);
	signalAborted(signal).finally(() => clearInterval(id));
	return id;
}

export function signalRaceController(...signals) {
	const controller = new AbortController();
	signals.race(signal => signalAborted(signal)).then(() => controller.abort());
	return controller;
}

export function signalAllController(...signals) {
	const controller = new AbortController();
	signals.all(signal => signalAborted(signal)).then(() => controller.abort());
	return controller;
}
