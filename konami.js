import { getDeferred } from './promises.js';

// Keycodes for: ↑ ↑ ↓ ↓ ← → ← → B A
const expectedPattern = '38384040373937396665';

export default async function konami({ signal, capture, passive = true } = {}) {
	const { resolve, reject, promise } = getDeferred({ signal });

	let rollingPattern = '';

	const listener = event => {
		rollingPattern += event.keyCode;
		rollingPattern = rollingPattern.slice(-expectedPattern.length);

		if (rollingPattern === expectedPattern) {
			globalThis.removeEventListener('keydown', listener, { capture, passive, signal });
			resolve();
		}
	};

	globalThis.addEventListener('keydown', listener, { capture, passive, signal });

	return promise;
}
