import { SVG, XLINK } from './namespaces.js';

export function createSVG({ fill = null, height = null, width = null, label = null,
	role = 'img', hidden = false, classes = [] } = {}) {
	const svg = document.createElementNS(SVG, 'svg');

	svg.setAttribute('role', role);

	if (typeof label === 'string') {
		svg.setAttribute('aria-label', label);
	}

	if (hidden === true) {
		svg.setAttribute('aria-hidden', 'true');
	}

	if (typeof height === 'number') {
		svg.setAttribute('height', height);
	}

	if (typeof width === 'number') {
		svg.setAttribute('width', width);
	}

	if (typeof fill === 'string') {
		svg.setAttribute('fill', fill);
	}

	if (Array.isArray(classes) && classes.length !== 0) {
		svg.classList.add(...classes);
	}

	return svg;
}

export function useSVG(sprite, { src = '/img/icons.svg', fill = null, height = null,
	width = null, classes = [], label = null } = {}) {
	const svg = createSVG({ fill, height, width, classes, label });
	const use = document.createElementNS(SVG, 'use');

	if (typeof src === 'string') {
		const url = new URL(src, document.baseURI);
		url.hash = `#${sprite}`;
		use.setAttributeNS(XLINK, 'xlink:href', url.href);
	} else {
		use.setAttributeNS(XLINK, 'xlink:href', `#${sprite}`);
	}

	svg.append(use);

	return svg;
}
