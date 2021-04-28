import { query, css } from './dom.js';

export const rootMargin = `${Math.floor(Math.max(0.4 * screen.height, 200))}px`;

const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach(({ target, isIntersecting }) => {
		if (isIntersecting) {
			requestAnimationFrame(() => target.replaceWith(target.content));
			observer.unobserve(target);
		}
	});
}, { rootMargin });

export function lazyObserve(what, base) {
	const items = query(what, base);
	items.forEach(item => {
		if (item instanceof HTMLTemplateElement) {
			lazyLoadObserver.observe(item);
			const { height = 1, width = 1 } = item.content.querySelector('img, iframe, video') || {};

			if (typeof height === 'number' && typeof width === 'number') {
				css(item, {
					'display': 'inline-block',
					'visibility': 'hidden',
					'width': `${width}px`,
					'height': `${height}px`,
				});
			} else if (typeof height === 'string' && typeof width === 'string') {
				css(item, {
					'display': 'inline-block',
					'visibility': 'hidden',
					'width': width,
					'height': height,
				});
			} else {
				css(item, {
					'display': 'inline-block',
					'visibility': 'hidden',
					'width': '1px',
					'height': '1px',
				});
			}
		}
	});
}
