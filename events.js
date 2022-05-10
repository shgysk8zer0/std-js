import { query, when } from './dom.js';
import { signalAborted } from './abort.js';
import { getDeferred } from './promises.js';
import { debounce as db, throttle } from './utility.js';

export function getEventFeatures() {
	const el = document.createElement('div');
	const eventFeatures = {
		nativeSignal: 'AbortController' in globalThis && AbortController.prototype.hasOwnProperty('signal'),
		signal: false,
		passive: false,
		capture: false,
		once: false,
	};

	// Use of a getter will detect support when properties are read
	const options = {
		get passive() {
			eventFeatures.passive = true;
			return undefined;
		},
		get signal() {
			eventFeatures.signal = true;
			return undefined;
		},
		get capture() {
			eventFeatures.capture = true;
			return undefined;
		},
		get once() {
			eventFeatures.once = true;
			return undefined;
		},
	};

	try {
		el.addEventListener('click', null, options);
		el.removeEventListener('click', null, options);
	} catch(err) {
		console.error(err);
	}

	return Object.seal(eventFeatures);
}

export const features = getEventFeatures();

export function addListener(targets, events, callback, { capture, once, passive, signal } = {}) {
	if (! Array.isArray(targets)) {
		targets = query(targets);
	}

	if (! Array.isArray(events)) {
		events = Array.of(events);
	}

	targets.forEach(target => {
		events.forEach(event => listen(target, event, callback, { capture, once, passive, signal }));
	});
}

export function listen(target, event, callback, { capture, once, passive, signal } = {}) {
	if (! (signal instanceof EventTarget && signal.aborted)) {
		target.addEventListener(event, callback, { capture, once, passive, signal });

		if (features.signal === false && signal instanceof EventTarget) {
			signalAborted(signal).finally(() => target.removeEventListener(event, callback, { capture, once, passive, signal }));
		}
	}
}

export function onKeypress(key, callback, {
	target = globalThis,
	type = 'keypress',
	capture,
	once,
	passive,
	signal,
	altKey,
	ctrlKey,
	metaKey,
	shiftKey,
} = {}) {
	listen(target, type, function handler(event) {
		if (
			event.isTrusted && event.key.toLowerCase() === key.toLowerCase()
			&& Object.entries({ ctrlKey, altKey, shiftKey, metaKey }).every(([name, value]) => {
				return typeof value !== 'boolean' || event[name] === value;
			})) {
			if (once) {
				target.removeEventListener(type, handler, { passive, capture, signal });
			}

			callback.call(this, event);
		}
	}, { passive, capture, signal });
}

export async function once(target, event, { capture, passive, signal } = {}) {
	const { resolve, promise } = getDeferred({ signal, reason: new DOMException('Operation aborted') });
	listen(target, event, resolve, { capture, once: true, passive, signal });
	return await promise;
}

export function removeListener(targets, events, callback, { capture, once, passive, signal } = {}) {
	if (! Array.isArray(targets)) {
		targets = query(targets);
	}

	if (! Array.isArray(events)) {
		events = Array.of(events);
	}

	targets.forEach(target => {
		events.forEach(event => target.removeEventListener(event, callback, { capture, once, passive, signal }));
	});
}

/**
 * Control the execution rate of callbacks, i.e. for listeners
 * https://davidwalsh.name/function-debounce
 *
 * @param  Callable callback    The callback
 * @param  int      [ms]        Number of milliseconds, defaulting to 1/60th a second
 * @param  bool     [immediate] Trigger function immediately instead of after wait ms
 * @return function             Rate limited function
 */
export function debounce(func, wait = 17, immediate = false) {
	console.warn('debounce() in events.js is deprecated. Please use utility.js instead.');
	return immediate ? throttle(func, { delay: wait }): db(func, { delay: wait });
}

export async function whenOnline({ signal } = {}) {
	if (navigator.onLine === false) {
		await when(window, 'online', { signal });
	}
}

export async function whenOffline({ signal } = {}) {
	if (navigator.onLine === true) {
		await when(window, 'offline', { signal });
	}
}

export async function whenVisible({ signal } = {}) {
	if (document.visibilityState === 'hidden') {
		await when(document, 'visibilitychange', { signal });
	}
}

export async function whenHidden({ signal } = {}) {
	if (document.visibilityState === 'visible') {
		await when(document, 'visibilitychange', { signal });
	}
}
