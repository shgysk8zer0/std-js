import { listen } from './events.js';
import { getDeferred } from './promises.js';

export async function *yieldEvents(target, event, { signal, passive, capture, throwError = false } = {}) {
	if (! (target instanceof EventTarget)) {
		throw new TypeError('Target is not a valid `EventTarget`');
	} else if (typeof event !== 'string' || event.length === 0) {
		throw new TypeError('Not a valid event');
	} else if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason;
	} else {
		const key = Symbol(`${event}-promise`);
		const controller = new AbortController();

		listen(target, event, function(event) {
			const { resolve, reject } = this[key];
			delete this[key];

			if (signal instanceof AbortSignal && signal.aborted) {
				reject(signal.reson);
			} else {
				resolve(event);
			}
		}, { signal: controller.signal, passive, capture });

		while (! controller.signal.aborted) {
			try {
				if (typeof target[key] !== 'undefined') {
					await target[key].promise;
				}

				target[key] = getDeferred({ signal });

				yield await target[key].promise;
			} catch(err) {
				delete target[key];

				if (! controller.signal.aborted) {
					controller.abort(err);
				}

				if (throwError) {
					throw err;
				}
			}
		}
	}
}
