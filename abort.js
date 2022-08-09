import { when, beforeUnload, unloaded } from './dom.js';
import { getDeferred } from './promises.js';
import { listen } from './events.js';
export const supported =  'AbortController' in window && AbortController.prototype.hasOwnProperty('signal');

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

export function abortButtonController(button, { reason } = {}) {
	if (! (button instanceof HTMLButtonElement)) {
		throw new TypeError('Not a <button>');
	}

	const controller = new AbortController();
	button.disabled = false;

	listen(button, 'click', () => controller.abort(reason), { signal: controller.signal, once: true });
	listen(controller.signal, 'abort', () => button.disabled = true, { once: true });

	return controller;
}

/**
 * @deprecated
 */
export function abortTimeoutController(timeout, { reason } = {}) {
	console.warn('`abortTimeoutController()` is deprecated. Use `AbortSignal.timeout()` instead.');
	const controller = new AbortController();

	abortableTimeout(() => controller.abort(reason), timeout, { signal: controller.signal });

	return controller;
}

/**
 * @deprecated
 */
export function abortTimeoutSignal(timeout, { reason } = {}) {
	return abortTimeoutController(timeout, { reason }).signal;
}

export function abortEventController(what, events, { passive, capture, reason } = {}) {
	const controller = new AbortController();

	when(what, events, { signal: controller.signal, capture, passive, once: true }).then(() => {
		if (! controller.signal.aborted) {
			controller.abort(reason);
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
	const signal = anyAbortedSignal(...signals);

	signal.addEventListener('abort', ({ target }) => {
		controller.abort(target.reason || new DOMException('Operation aborted.'));
	}, { signal: controller.signal });

	return controller;
}

export function signalAllController(...signals) {
	const controller = new AbortController();

	Promise.all(signals.map(signal => signalAborted(signal))).finally(() => controller.abort());

	return controller;
}

export function anyAbortedSignal(...signals) {
	if (AbortSignal.any instanceof Function) {
		return AbortSignal.any(signals);
	} else {
		const controller = new AbortController();

		for (const signal of signals) {
			if (! (signal instanceof AbortSignal)) {
				const err = new TypeError('`signal` is not an `AbortSignal`');
				controller.abort(err);
				throw err;
			} else if (signal.aborted) {
				controller.abort(signal.reason || new DOMException('Operation aborted.'));
				break;
			} else {
				signal.addEventListener('abort', ({ target }) => {
					controller.abort(target.reason || new DOMException('Operation aborted.'));
				}, { signal: controller.signal });
			}
		}

		return controller.signal;
	}
}
