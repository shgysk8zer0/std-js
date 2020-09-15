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
					entries.forEach(({
						target,
						isIntersecting,
						boundingClientRect,
						intersectionRatio,
						intersectionRect = null,
						rootBounds,
						time,
					}) => {
						if (isIntersecting) {
							const prom = intEls.get(target);

							if (prom instanceof Function) {
								prom({
									target,
									isIntersecting,
									boundingClientRect,
									intersectionRatio,
									intersectionRect,
									rootBounds,
									time,
								});
								intEls.delete(target);

								if (! unIntEls.has(target)) {
									observer.unobserve(target);
								}
							}
						} else {
							const prom = unIntEls.get(target);

							if (prom instanceof Function) {
								prom({
									target,
									isIntersecting,
									boundingClientRect,
									intersectionRatio,
									intersectionRect,
									rootBounds,
									time,
								});
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

export async function whenInViewport(target) {
	if (typeof target === 'string') {
		return whenInViewport(document.querySelector(target));
	} else if (! (target instanceof Element)) {
		throw new Error('Invalid element or selector');
	} else if (isInViewport(target)) {
		return {
			target,
			isIntersecting: true,
			boundingClientRect: target.getBoundingClientRect(),
			intersectionRatio: NaN,
			/**
			 * DOMRect is poorly supported and calculating value may be impractical,
			 * so just return an object with all keys set and values of NaN
			 */
			intersectionRect: { x: NaN, y: NaN, height: NaN, width: NaN, top: NaN, bttom: NaN, left: NaN, right: NaN},
			rootBounds: null,
			time: 0,
		};
	} else {
		return await observe(target, true);
	}
}

export async function whenNotInViewport(target) {
	if (typeof target === 'string') {
		return await whenNotInViewport(document.querySelector(target));
	} else if (! isInViewport(target)) {
		return {
			target,
			isIntersecting: false,
			boundingClientRect: target.getBoundingClientRect(),
			intersectionRatio: 0,
			/**
			 * DOMRect is poorly supported, but we do know that zero area is intersecting,
			 * so set all keys with values of 0
			 */
			intersectionRect: { x: 0, y: 0, height: 0, width: 0, top: 0, bttom: 0, left: 0, right: 0},
			rootBounds: null,
			time: 0,
		};
	} else {
		return await observe(target, false);
	}
}

export async function whenInViewportFor(el, ms = 1000) {
	if (typeof el === 'string') {
		return whenInViewportFor(document.querySelector(el), ms);
	} else if (! (el instanceof Element)) {
		throw new Error('Invalid element or selector');
	} else {
		return await new Promise(async resolve => {
			let done = false;
			let retVal = null;

			while (! done) {
				retVal = await whenInViewport(el);
				const timer = setTimeout(() => {
					done = true;
					resolve(el);
				}, Math.max(ms, 1)) || 1;

				await whenNotInViewport(el).then(() => clearTimeout(timer));
			}
			return retVal;
		});
	}
}
