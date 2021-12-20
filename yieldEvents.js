import { addListener } from './events.js';


export async function *yieldEvents(target, event, { signal, passive = true, capture = false } = {}) {
	if (! (target instanceof EventTarget)) {
		throw new TypeError('Is not a valid event target');
	} else if (typeof event === 'string') {
		throw new TypeError('Not a valid event');
	} else {
		const key = Symbol(`${event}-promise`);
		const callback = function(event) {
			if (typeof this[key] !== 'undefined') {
				const { resolve } = this[key];
				delete this[key];
				resolve(event);
			}
		};

		addListener([target], [event], callback , { signal, passive, capture });

		while (! (signal instanceof AbortSignal && signal.aborted)) {
			if (typeof target[key] !== 'undefined') {
				await target[key].promise;
			}

			target[key] = getDeferred();
			yield await target[key].promise;
		}
	}
}
