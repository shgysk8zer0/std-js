import { query, when } from './dom.js';
import { signalAborted } from './abort.js';

function getEventFeatures() {
	const el = document.createElement('div');
	const eventFeatures = {
		nativeSignal: 'AbortController' in window && AbortController.prototype.hasOwnProperty('signal'),
		signal: false,
		passive: false,
		capture: false,
		once: false,
	};

	// Use of a getter will detect support when properties are read
	const options = {
		get passive() {
			eventFeatures.passive = true;
			return true;
		},
		get signal() {
			eventFeatures.signal = true;
			return new AbortController().signal;
		},
		get capture() {
			eventFeatures.capture = true;
			return true;
		},
		get once() {
			eventFeatures.once = true;
			return false;
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
		events.forEach(event => target.addEventListener(event, callback, { capture, once, passive, signal }));
	});

	if (signal instanceof AbortSignal && (features.nativeSignal === false || features.signal === false)) {
		signalAborted(signal).finally(() => {
			removeListener(targets, events, callback, { capture, once, passive, signal });
		});
	}
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
	let timeout;

	return function(...args) {
		const later = () => {
			timeout = null;

			if (! immediate) {
				func.apply(this, args);
			}
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);

		if (immediate && ! timeout) {
			func.apply(this, args);
		}
	};
}

export async function whenOnline() {
	if (navigator.onLine === false) {
		await when(window, 'online');
	}
}

export async function whenOffline() {
	if (navigator.onLine === true) {
		await when(window, 'offline');
	}
}

export async function whenVisible() {
	if (document.visibilityState === 'hidden') {
		await when(document, 'visibilitychange');
	}
}

export async function whenHidden() {
	if (document.visibilityState === 'visible') {
		await when(document, 'visibilitychange');
	}
}
