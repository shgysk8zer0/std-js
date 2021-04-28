import { query, css } from './dom.js';

export const rootMargin = `${Math.floor(Math.max(0.4 * screen.height, 200))}px`;

export const lazyClass = 'lazy-load';

export const lazySelector = `template.${lazyClass}`;

const intersectObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach(({ target, isIntersecting }) => {
		if (isIntersecting) {
			requestAnimationFrame(() => target.replaceWith(target.content));
			observer.unobserve(target);
		}
	});
}, { rootMargin });

const mutateObserver = new MutationObserver(records => {
	records.forEach(({ addedNodes, type }) => {
		if (type === 'childList') {
			addedNodes.forEach(node => {
				if (node instanceof Element) {
					query(lazySelector, node).forEach(lazyLoad);
				}
			});
		}
	});
});

export function lazyIntersect(base = document.body) {
	query(lazySelector, base).forEach(lazyLoad);
}

export function lazyLoad(el) {
	if (el instanceof HTMLTemplateElement && el.classList.contains(lazyClass)) {
		el.classList.remove(lazyClass);
		intersectObserver.observe(el);
		const { height = 1, width = 1 } = el.content.querySelector('img, iframe, video') || {};

		if (typeof height === 'number' && typeof width === 'number') {
			css(el, {
				'display': 'inline-block',
				'visibility': 'hidden',
				'width': `${width}px`,
				'height': `${height}px`,
			});
		} else if (typeof height === 'string' && typeof width === 'string') {
			css(el, {
				'display': 'inline-block',
				'visibility': 'hidden',
				'width': width,
				'height': height,
			});
		} else {
			css(el, {
				'display': 'inline-block',
				'visibility': 'hidden',
				'width': '1px',
				'height': '1px',
			});
		}
	} else {
		throw new TypeError('Can only lazy-load `<template class="lazy-load">` elements');
	}
}

export function lazyLoadInit(base = document.body) {
	lazyIntersect(base);

	mutateObserver.observe(base, {
		subtree: true,
		childList: true,
	});
}
