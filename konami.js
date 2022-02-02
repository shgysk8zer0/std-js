import { getDeferred } from './promises.js';
import { listen } from './events.js';

// Keycodes for: ↑ ↑ ↓ ↓ ← → ← → B A
const UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39, B = 66, A = 65;
const PATTERN = [UP, UP, DOWN, DOWN, LEFT, RIGHT, LEFT, RIGHT, B, A];

export async function konami({ signal, capture } = {}) {
	const { resolve, reject, promise } = getDeferred({ signal });
	const controller = new AbortController();
	let n = 0;

	if (signal instanceof AbortSignal) {
		listen(signal, 'abort', ({ target: { reason }}) => {
			reject(reason);
			controller.abort(reason);
		}, { signal: controller.signal });
	}

	listen(globalThis, 'keydown', ({ keyCode }) => {
		if (keyCode !== PATTERN.at(n)) {
			n = 0;
		} else if (++n === PATTERN.length) {
			resolve('↑ ↑ ↓ ↓ ← → ← → B A');
			controller.abort('done');
		}
	}, { capture, signal: controller.signal, passive: true });

	return promise;
}

export default async function(...args) {
	console.warn('Default export in "konami.js" is deprecated. Please import `{ konami }`');
	return konami(...args);
}
