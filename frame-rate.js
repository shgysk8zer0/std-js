import { getDeferred } from './promises.js';

export async function checkFrameRate({ signal, timeout } = {}) {
	const { promise, resolve, reject } = getDeferred();

	if (! (globalThis.requestIdleCallback instanceof Function)) {
		reject(new DOMException('`requestIdleCallback()` not supported.'));
	} if (signal instanceof globalThis.AbortSignal && signal.aborted) {
		reject(signal.reason || new DOMException('Operation aborted.'));
	} else {
		let idle, first, last;
		const abort = ({ target: {
			reason = new DOMException('Operation aborted.'),
		}}) => {
			reject(reason);

			if (typeof idle  === 'number') cancelIdleCallback(idle);
			if (typeof first === 'number') cancelAnimationFrame(first);
			if (typeof last  === 'number') cancelAnimationFrame(last);
		};

		if (signal instanceof globalThis.AbortSignal) {
			signal.addEventListener('abort', abort, { once: true });
		}

		idle = requestIdleCallback(() => {
			first = requestAnimationFrame(start => {
				last = requestAnimationFrame(end => {
					resolve(parseInt(1000 / (end - start)));

					if (signal instanceof globalThis.AbortSignal) {
						signal.removeEventListener('abort', abort, { once: true });
					}
				});
			});
		}, { timeout });
	}

	return promise;
}
