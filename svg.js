/**
 * @copyright 2022-2023 Chris Zuber <admin@kernvalley.us>
 */
import { SVG, XLINK } from './namespaces.js';
import { isObject } from './utility.js';
import { css, data, attr } from './attrs.js';
import { SVG as TYPE } from './types.js';

export const rotate = n => `rotate(${n})`;
export const scale = n => `scale(${n})`;
export const translate = (x, y) => `translate(${x}, ${y})`;

export function createSVGFile(svg, { name = 'image.svg' } = {}) {
	if (svg instanceof SVGElement) {
		return new File([svg.outerHTML], name, { type: TYPE });
	} else {
		throw new TypeError('Expected an <svg>');
	}
}

export function createSVGElement (tag, {
	fill, stroke, width, height, pathLength, children = [], id, classList = [],
	styles, dataset,
	events: {
		capture,
		passive,
		once,
		signal,
		...events
	} = {},
	animation: {
		keyframes,
		duration = 0,
		delay = 0,
		endDelay = 0,
		easing = 'linear',
		direction = 'normal',
		fill: svgFill = 'none',
		iterations = 1,
		iterationStart = 0,
		composite = 'replace',
		iterationComposite = 'replace',
		pseudoElement,
	} = {},
	...rest } = {}) {
	const el = document.createElementNS(SVG, tag);
	
	if (typeof id === 'string') {
		el.id = id;
	}
	
	if (Array.isArray(classList) && classList.length !== 0) {
		el.classList.add(...classList);
	}

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

	if (typeof rest.title === 'string') {
		const title = createSVGElement('title');
		title.textContent = rest.title;
		el.prepend(title);
	}

	if (Array.isArray(keyframes) || isObject(keyframes) && el.animate instanceof Function) {
		el.animate(keyframes, {
			duration, delay, endDelay, easing, direction, fill: svgFill, iterations,
			iterationStart, composite, iterationComposite, pseudoElement,
		});
	}
	
	if (Array.isArray(children) && children.length !== 0) {
		el.append(...children.filter(node => (typeof node === 'string') || (node instanceof Element)));
	}

	if (isObject(styles)) {
		css(el, styles);
	}

	if (isObject(events)) {
		Object.entries(events).forEach(
			([event, callback]) => el.addEventListener(event, callback, { capture, passive, once, signal })
		);
	}

	if (isObject(dataset)) {
		data(el, dataset);
	}

	attr(el, rest);

	return el;
}

export function createSVG({
	id = null,
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
	animation,
	part = [],
	...rest
} = {}) {
	const svg = createSVGElement('svg', { width, height, fill, animation, children, id, classList, ...rest });

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
	id = null,
	src = '/img/icons.svg',
	fill = null,
	height = null,
	width = null,
	slot = null,
	part = [],
	classList = [],
	label = null,
	animation,
	...rest
} = {}) {
	const svg = createSVG({ id, fill, height, width, classList, label, slot, part, animation, hidden: true, ...rest });
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

export function createPath(d, { id, fill, stroke, pathLength, animation, ...rest } = {}) {
	const path = createSVGElement('path', { id, fill, stroke, pathLength, animation, ...rest });

	if (Array.isArray(d) && d.length !== 0) {
		path.setAttribute('d', d.join(' '));
	} else if (typeof d === 'string') {
		path.setAttribute('d', d);
	} else {
		throw new TypeError('Invalid `d` attribute in <path>.');
	}

	return path;
}

export function createGroup({ id, fill, stroke, children, animation, ...attrs }) {
	return createSVGElement('g', { id, fill, stroke, children, animation, ...attrs });
}

export function createRect({ id, width, height, x, y, rx, ry, fill, stroke, pathLength, animation, ...rest }) {
	return createSVGElement('rect', { id, width, height, x, y, rx, ry, fill, stroke, pathLength, animation, ...rest });
}

export function createCircle({ id, width, height, cx, cy, r, fill, stroke, pathLength, animation, ...rest }) {
	return createSVGElement('circle', { id, width, height, cx, cy, r, fill, stroke, pathLength, animation, ...rest });
}

export function createEllipse({ id, width, height, cx, cy, rx, ry, fill, stroke, pathLength, animation, ...rest }) {
	return createSVGElement('ellipse', { id, width, height, cx, cy, rx, ry, fill, stroke, pathLength, animation, ...rest });
}

export function createPolygon(points, { id, fill, stroke, pathLength, animation, ...rest } = {}) {
	const polygon = createSVGElement('polygon', { id, fill, stroke, pathLength, animation, ...rest });

	if (Array.isArray(points) && points.length !== 0) {
		polygon.setAttribute('points', points.map(([x, y]) => `${x},${y}`).join(' '));
	} else if (typeof points === 'string') {
		polygon.setAttribute('points', points);
	} else {
		throw new TypeError('Invalid `points` attribute in <polygon>.');
	}

	return polygon;
}

export function createPolyline(points, { id, fill, stroke, pathLength, animation, ...rest } = {}) {
	const polyline = createSVGElement('polyline', { id, fill, stroke, pathLength, animation, ...rest });

	if (Array.isArray(points) && points.length !== 0) {
		polyline.setAttribute('points', points.map(([x, y]) => `${x},${y}`).join(' '));
	} else if (typeof points === 'string') {
		polyline.setAttribute('points', points);
	} else {
		throw new TypeError('Invalid `points` attribute in <polygon>.');
	}

	return polyline;
}

export function createLine([[x1, y1], [x2, y2]], { id, fill, stroke, pathLength, animation, ...rest } = {}) {
	if (! [x1, x2, y1, y2].every(n => typeof n === 'number' && ! Number.isNaN(n))) {
		throw new TypeError('Invalid coordinates in <line>.');
	} else {
		return createSVGElement('line', { id, fill, stroke, x1, y1, x2, y2, pathLength, animation, ...rest });
	}
}

export { TYPE };
