import { on, when } from './dom.js';
import { isAborted } from './abort.js';

export async function *yieldEvents(what, events, { capture, passive, signal } = {}) {
	const queue = [];
	const target = new EventTarget();

	on(what, events, event => {
		queue.push(event);
		target.dispatchEvent(new Event('enqueued'));
	}, { capture, passive, signal });

	while (! isAborted(signal)) {
		if (queue.length === 0) {
			await when(target, 'enqueued', { signal }).catch(e => {});
		}

		/**
		 * May have aborted between beginning of loop and now
		 */
		if (isAborted(signal)) {
			break;
		} else {
			yield queue.shift();
		}
	}
}
