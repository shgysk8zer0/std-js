import './shims/abort.js';
import { when, beforeUnload, unloaded } from './dom.js';
import { getDeferred } from './promises.js';
import { listen } from './events.js';
export const supported =  'AbortController' in window && AbortController.prototype.hasOwnProperty('signal');

export const unloadSignal = getUnloadSignal();

export const beforeUnloadSignal = getBeforeUnloadSignal();

export function throwIfAborted(signal) {
	if (signal instanceof AbortController) {
		signal.signal.throwIfAborted();
	} else if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}
}

export function getBeforeUnloadSignal() {
	const controller = new AbortController();
	beforeUnload().then(() => controller.abort());
	return controller.signal;
}

export function getUnloadSignal() {
	const controller = new AbortController();
	unloaded().then(() => controller.abort());
	return controller.signal;
}

export function isAborted(signal) {
	if (signal instanceof AbortController) {
		return signal.signal.aborted;
	} else {
		return signal instanceof AbortSignal && signal.aborted;
	}
}

export async function signalAborted(signal) {
	const { reject, promise } = getDeferred();

	if (signal instanceof AbortController) {
		return signalAborted(signal.signal);
	} else if (! (signal instanceof EventTarget)) {
		reject(new DOMException('Not an AbortSignal'));
	} else if (signal.aborted) {
		reject(signal.reason);
	} else {
		signal.addEventListener('abort', ({ target }) => reject(target.reason),{ once: true });
	}

	return promise;
}

export function abortButtonController(button) {
	if (! (button instanceof HTMLButtonElement)) {
		throw new TypeError('Not a <button>');
	}

	const controller = new AbortController();
	button.disabled = false;

	listen(button, 'click', () => controller.abort(), { signal: controller.signal, once: true });
	listen(controller.signal, 'abort', () => button.disabled = true, { once: true });

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
