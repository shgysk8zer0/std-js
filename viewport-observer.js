import { getDeferred } from '/js/std-js/promises.js';
const protectedData = new WeakMap();

export const rootMargin = `${Math.max(0.3 * screen.height, 200)}px`;

const observer = new IntersectionObserver((entries, observer) => {
	entries.forEach(({ target, isIntersecting }) => {
		if (isIntersecting && protectedData.has(target)) {
			const { resolve, signal, callback } = protectedData.get(target);
			observer.unobserve(target);
			protectedData.delete(target);

			if (signal instanceof AbortSignal) {
				signal.removeEventListener('abort', callback, { once: true });
			}

			resolve(target);
		}
	});
}, { rootMargin });

export async function observe(target, { signal } = {}) {
	if (protectedData.has(target)) {
		const { promise } = protectedData.get(target);
		return promise;
	} else {
		const { resolve, reject, promise } = getDeferred();

		if (! (signal instanceof AbortSignal)) {
			protectedData.set(target, { resolve, reject, promise });
			observer.observe(target);
		} else if (signal.aborted) {
			reject(new DOMException('Operation aborted'));
		} else {
			const callback = () => {
				observer.unobserve(target);
				protectedData.delete(target);
				reject(new DOMException('Operation aborted'));
			};

			protectedData.set(target, { resolve, reject, promise, signal, callback });
			signal.addEventListener('abort', callback, { once: true });
			observer.observe(target);
		}

		return promise;
	}
}

export async function observeAll(...targets) {
	return Promise.all(targets.map(target => observe(target)));
}

export async function observeAny(...targets) {
	const controller = new AbortController();
	const signal = controller.signal;
	const target = await Promise.race(targets.map(target => observe(target, { signal })));
	controller.abort();
	return target;
}

export function unobserve(target) {
	if (protectedData.has(target)) {
		const { reject, signal, callback } = protectedData.get(target);
		observer.unobserve(target);
		protectedData.delete(target);
		reject(new DOMException('Viewport observer unobserved target'));

		if (signal instanceof AbortSignal) {
			signal.removeEventListener('abort', callback, { once: true });
		}

		return true;
	} else {
		return false;
	}
}
