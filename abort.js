import './abort-shims.js';
import { when, on } from './dom.js';
import { infinitPromise, getDeferred } from './promises.js';
import { features } from './events.js';
export const supported =  'AbortController' in window && AbortController.prototype.hasOwnProperty('signal');

export function isAborted(signal) {
	if (signal instanceof AbortController) {
		return signal.signal.aborted;
	} else if (signal instanceof AbortSignal) {
		return signal.aborted;
	} else {
		return false;
	}
}

export async function signalAborted(signal, { reason } = {}) {
	if (signal instanceof AbortController) {
		return await signalAborted(signal.signal, { reason });
	} else if (! (signal instanceof AbortSignal)) {
		return infinitPromise;
	} else if (signal.aborted) {
		return typeof reason === 'undefined' ? Promise.resolve() : Promise.reject(reason);
	} else if (typeof reason === 'string') {
		const { reject, promise } = getDeferred();
		if (features.once) {
			signal.addEventListener('abort', () => reject(reason), { once: true });
		} else {
			const callback = () => {
				reject(reason),
				signal.removeEventListener('abort', callback);
			};

			signal.addEventListener('abort', callback);
		}
		return promise;
	} else {
		const { resolve, promise } = getDeferred();
		if (features.once) {
			signal.addEventListener('abort', () => resolve(), { once: true });
		} else {
			const callback = () => {
				resolve();
				signal.removeEventListener('abort', callback);
			};

			signal.addEventListener('abort', callback);
		}

		return promise;
	}
}

export function abortButtonController(button) {
	if (! (button instanceof HTMLButtonElement)) {
		throw new TypeError('Not a <button>');
	}

	const controller = new AbortController();
	button.disabled = false;

	on(button, 'click', () => controller.abort(), { signal: controller.signal, once: true });
	on(controller.signal, 'abort', () => button.disabled = true, { once: true });

	return controller;
}

export function abortTimeoutController(timeout) {
	const controller = new AbortController();

	abortableTimeout(() => controller.abort(), timeout, { signal: controller.signal });

	return controller;
}

export function abortEventController(what, events, { passive, capture } = {}) {
	const controller = new AbortController();

	when(what, events, { signal: controller.signal, capture, passive, once: true }).then(() => {
		if (! controller.signal.aborted) {
			controller.abort();
		}
	});

	return controller;
}

export function abortableTimeout(callback, ms, { signal } = {}) {
	const id = setTimeout(() => callback(), ms);

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => clearTimeout(id));
	}

	return id;
}

export function abortableInterval(callback, ms, { signal } = {}) {
	const id = setInterval(() => callback(), ms);

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => clearInterval(id));
	}

	return id;
}

export function abortableAnimationFrame(callback, { signal } = {}) {
	const id = requestAnimationFrame(callback);

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => cancelAnimationFrame(id));
	}

	return id;
}

export function abortableIdleCallback(callback, { signal, timeout } = {}) {
	const id = requestIdleCallback(callback);

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => cancelIdleCallback(id, { timeout }));
	}

	return id;
}

export function signalRaceController(...signals) {
	const controller = new AbortController();

	Promise.race(signals.map(signal => signalAborted(signal))).finally(() => controller.abort());

	return controller;
}

export function signalAllController(...signals) {
	const controller = new AbortController();

	Promise.all(signals.map(signal => signalAborted(signal))).finally(() => controller.abort());

	return controller;
}
