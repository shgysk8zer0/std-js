import { SVG, XLINK } from './namespaces.js';

export function createSVGElement (tag, { fill, stroke, width, height, pathLength, ...rest } = {}) {
	const el = document.createElementNS(SVG, tag);

	if (typeof fill === 'string') {
		el.setAttribute('fill', fill);
	}

	if (typeof stroke === 'string') {
		el.setAttribute('stroke', stroke);
	}

	if (typeof height === 'number' && ! Number.isNaN(height)) {
		el.setAttribute('height', height.toString());
	}

	if (typeof width === 'number' && ! Number.isNaN(width)) {
		el.setAttribute('width', width.toString());
	}

	if (typeof pathLength === 'number' && ! Number.isNaN(pathLength)) {
		el.setAttribute('pathLength', pathLength.toString());
	}

	Object.entries(rest).forEach(([name, val]) => {
		if (val instanceof URL) {
			el.setAttribute(name, val.href);
		} else if (typeof val === 'string') {
			el.setAttribute(name, val);
		} else if (typeof val === 'number' && ! Number.isNaN(val)) {
			el.setAttribute(name, val.toString());
		} else if (Array.isArray(val) && val.length !== 0) {
			el.setAttribute(name, val.join(' '));
		} else if (typeof val === 'boolean') {
			el.toggleAttribute(name, val);
		}
	});

	return el;
}

export function createSVG({
	fill = null,
	viewBox = null,
	height = null,
	width = null,
	label = null,
	slot = null,
	role = 'img',
	hidden = false,
	classList = [],
	children = [],
	part = [],
	...rest
} = {}) {
	const svg = createSVGElement('svg', { width, height, fill, ...rest });

	svg.setAttribute('role', role);

	if (typeof viewBox === 'string') {
		svg.setAttributeNS(null, 'viewBox', viewBox);
	} else if (Array.isArray(viewBox)) {
		svg.setAttributeNS(null, 'viewBox', viewBox.map(n => n.toString()).join(' '));
	}

	if (typeof label === 'string') {
		svg.setAttribute('aria-label', label);
	}

	if (hidden === true) {
		svg.setAttribute('aria-hidden', 'true');
	}

	if (typeof slot === 'string') {
		svg.slot = slot;
	}

	if (Array.isArray(classList) && classList.length !== 0) {
		svg.classList.add(...classList);
	}

	if (Array.isArray(children) && children.length !== 0) {
		svg.append(...children);
	}

	if (Array.isArray(part) && part.length !== 0) {
		if('part' in svg) {
			svg.part.add(...part);
		} else {
			svg.setAttribute('part', part.join(' '));
		}
	}

	return svg;
}

export function useSVG(sprite, {
	src = '/img/icons.svg',
	fill = null,
	height = null,
	width = null,
	slot = null,
	part = [],
	classList = [],
	label = null,
	...rest
} = {}) {
	const svg = createSVG({ fill, height, width, classList, label, slot, part, hidden: true, ...rest });
	const use = createSVGElement('use');

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

export function createPath(d, { fill, stroke, pathLength, ...rest } = {}) {
	const path = createSVGElement('path', { fill, stroke, pathLength, ...rest });

	if (Array.isArray(d) && d.length !== 0) {
		path.setAttribute('d', d.join(' '));
	} else if (typeof d === 'string') {
		path.setAttribute('d', d);
	} else {
		throw new TypeError('Invalid `d` attribute in <path>.');
	}

	return path;
}

export function createRect({ width, height, x, y, rx, ry, fill, stroke, pathLength, ...rest }) {
	return createSVGElement('rect', { width, height, x, y, rx, ry, fill, stroke, pathLength, ...rest });
}

export function createCircle({ width, height, cx, cy, r, fill, stroke, pathLength, ...rest }) {
	return createSVGElement('circle', { width, height, cx, cy, r, fill, stroke, pathLength, ...rest });
}

export function createEllipse({ width, height, cx, cy, rx, ry, fill, stroke, pathLength, ...rest }) {
	return createSVGElement('ellipse', { width, height, cx, cy, rx, ry, fill, stroke, pathLength, ...rest });
}

export function createPolygon(points, { fill, stroke, pathLength, ...rest } = {}) {
	const polygon = createSVGElement('polygon', { fill, stroke, pathLength, ...rest });

	if (Array.isArray(points) && points.length !== 0) {
		polygon.setAttribute('points', points.map(([x, y]) => `${x},${y}`).join(' '));
	} else if (typeof points === 'string') {
		polygon.setAttribute('points', points);
	} else {
		throw new TypeError('Invalid `points` attribute in <polygon>.');
	}

	return polygon;
}

export function createPolyline(points, { fill, stroke, pathLength, ...rest } = {}) {
	const polyline = createSVGElement('polyline', { fill, stroke, pathLength, ...rest });

	if (Array.isArray(points) && points.length !== 0) {
		polyline.setAttribute('points', points.map(([x, y]) => `${x},${y}`).join(' '));
	} else if (typeof points === 'string') {
		polyline.setAttribute('points', points);
	} else {
		throw new TypeError('Invalid `points` attribute in <polygon>.');
	}

	return polyline;
}

export function createLine([[x1, y1], [x2, y2]], { fill, stroke, pathLength, ...rest } = {}) {
	if (! [x1, x2, y1, y2].every(n => typeof n === 'number' && ! Number.isNaN(n))) {
		throw new TypeError('Invalid coordinates in <line>.');
	} else {
		return createSVGElement('line', { fill, stroke, x1, y1, x2, y2, pathLength, ...rest });
	}
}
