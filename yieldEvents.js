import { addListener } from './events.js';
import { getDeferred } from './promises.js';

export async function *yieldEvents(target, event, { signal, passive, capture } = {}) {
	if (! (target instanceof EventTarget)) {
		throw new TypeError('Target is not a valid `EventTarget`');
	} else if (typeof event !== 'string') {
		throw new TypeError('Not a valid event');
	} else if (signal instanceof AbortSignal && signal.aborted) {
		throw new DOMException('Operation aborted');
	} else {
		const key = Symbol(`${event}-promise`);
		const controller = new AbortController();
		const callback = function(event) {
			if (typeof this[key] !== 'undefined') {
				const { resolve } = this[key];
				delete this[key];
				resolve(event);
			}
		};

		if (signal instanceof AbortSignal && ! signal.aborted) {
			signal.addEventListener('abort', () => {
				controller.abort();
				if (typeof target[key] !== 'undefined') {
					const { resolve } = target[key];
					delete target[key];
					resolve();
				}
			}, { signal: controller.signal, once: true });
		}

		addListener([target], [event], callback , { signal: controller.signal, passive, capture });

		while (! controller.signal.aborted) {
			if (typeof target[key] !== 'undefined') {
				await target[key].promise;
			}

			target[key] = getDeferred();
			yield await target[key].promise;
		}
	}
}
