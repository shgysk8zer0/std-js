import { getDeferred } from './promises.js';

const protectedData = new WeakMap();

const observer = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			const { resolve } = protectedData.get(entry.target);
			protectedData.delete(entry.target);
			resolve(entry);
			observer.unobserve(entry.target);
		}
	});
}, {
	rootMargin: `${Math.min(250, Math.floor(screen.height * 0.3))}px`,
});

export async function whenIntersecting(target, { signal, base = document } = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason);
	} else if (typeof target === 'string') {
		whenIntersecting(base.querySelector(target), { signal }).then(resolve).catch(reject);
	} else if (! (target instanceof Element)) {
		reject(new TypeError('Non-elements can never intersect'));
	} else if (protectedData.has(target)) {
		protectedData.get(target).promise.then(resolve).catch(reject);

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target: { reason }}) => {
				reject(reason);
			}, { once: true });
		}
	} else {
		protectedData.set(target, { resolve, reject, promise });
		observer.observe(target);

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target: { reason }}) => {
				observer.unobserve(target);

				if (protectedData.has(target)) {
					protectedData.get(target).reject(reason);
					protectedData.delete(target);
				}
			}, { once: true });
		}
	}

	return promise;
}
