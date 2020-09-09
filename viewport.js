import { isInViewport } from './functions.js';

let observer   = null;
const intEls   = new WeakMap();
const unIntEls = new WeakMap();

async function observe(el, intersecting = true) {
	return await new Promise((resolve, reject) => {
		const elIsIntersecting = isInViewport(el);

		if (intersecting && elIsIntersecting) {
			resolve(el);
		} else if (! intersecting && ! elIsIntersecting) {
			resolve(el);
		} else if (! intersectionObserverSupported()) {
			reject(new Error('IntersectionObserver not supported'));
		} else {
			if (! (observer instanceof IntersectionObserver)) {
				observer = new IntersectionObserver((entries, observer) => {
					entries.forEach(({ target, isIntersecting }) => {
						if (isIntersecting) {
							const prom = intEls.get(target);

							if (prom instanceof Function) {
								prom(target);
								intEls.delete(target);

								if (! unIntEls.has(target)) {
									observer.unobserve(target);
								}
							}
						} else {
							const prom = unIntEls.get(target);

							if (prom instanceof Function) {
								prom(target);
								unIntEls.delete(target);

								if (! intEls.has(target)) {
									observer.unobserve(target);
								}
							}
						}
					});
				});
			}

			if (intersecting) {
				intEls.set(el, resolve);
				observer.observe(el);
			} else {
				unIntEls.set(el, resolve);
				observer.observe(el);
			}
		}
	});
}

export function intersectionObserverSupported() {
	return 'IntersectionObserver' in window;
}

export function getViewportBounds() {
	const { height, width } = screen;
	return [
		[scrollX, scrollY],
		[scrollX + width, scrollY],
		[scrollX + width, scrollY + height],
		[scrollX, scrollY + height]
	];
}

export async function whenInViewport(el) {
	if (typeof el === 'string') {
		return whenInViewport(document.querySelector(el));
	} else if (! (el instanceof Element)) {
		throw new Error('Invalid element or selector');
	} else if (isInViewport(el)) {
		return el;
	} else {
		return await observe(el, true);
	}
}

export async function whenNotInViewport(el) {
	if (typeof el === 'string') {
		return whenNotInViewport(document.querySelector(el));
	} else if (! isInViewport(el)) {
		return el;
	} else {
		return await observe(el, false);
	}
}

export async function whenInViewportFor(el, ms = 1000) {
	if (typeof el === 'string') {
		return whenInViewportFor(document.querySelector(el, ms));
	} else if (! (el instanceof Element)) {
		throw new Error('Invalid element or selector');
	} else {
		return await new Promise(async resolve => {
			let done = false;

			while (! done) {
				await whenInViewport(el);
				const timer = setTimeout(() => {
					done = true;
					resolve(el);
				}, ms);

				await whenNotInViewport(el).then(() => clearTimeout(timer));
			}
		});
	}
}
