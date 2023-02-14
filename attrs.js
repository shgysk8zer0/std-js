import { clamp, between } from './math.js';
import { isObject } from './utility.js';
import { isScriptURL } from './trust.js';

export function getAttrs(el) {
	if (typeof el === 'string') {
		return getAttrs(document.querySelector(el));
	} else if (el instanceof Element) {
		return Object.fromEntries([...el.attributes].map(({ name, value }) => [name, value]));
	} else {
		throw new TypeError(`Expected an element or selector but got a ${typeof el}`);
	}
}

export function data(el, props = {}) {
	if (! (el instanceof Element)) {
		throw new TypeError('el must be an Element');
	} if (! isObject(props)) {
		throw new TypeError('props must be an object');
	} else {
		Object.entries(props).forEach(([p, v]) => {
			switch (typeof v) {
				case 'string':
				case 'number':
					el.dataset[p] = v.toString();
					break;

				case 'boolean':
					if (v) {
						el.dataset[p] = '';
					} else {
						delete el.dataset[p];
					}
					break;

				case 'undefined':
					delete el.dataset[p];
					break;

				case 'object':
					if (Object.is(v, null)) {
						delete el.dataset[p];
					} else if (v instanceof Date) {
						el.dataset[p] = v.toISOString();
					} else if (v instanceof URL) {
						el.dataset[p] = v.href;
					} else {
						el.dataset[p] = JSON.stringify(v);
					}
					break;

				default:
					throw new TypeError(`Unable to handle type: ${typeof v}`);
			}
		});
	}
}

export function css(el, props = {}, { priority } = {}) {
	if (! (el instanceof Element)) {
		throw new TypeError('el must be an Element');
	} if (! isObject(props)) {
		throw new TypeError('props must be an object');
	} else {
		Object.entries(props).forEach(([p, v]) => {
			if (typeof v === 'string' || typeof v === 'number') {
				el.style.setProperty(p, v, priority);
			} else if (v instanceof URL) {
				el.type.setProperty(p, v.href, priority);
			} else {
				el.style.removeProperty(p);
			}
		});
	}
}

export function attr(el, props = {}, { namespace = null } = {}) {
	if (! (el instanceof Element)) {
		throw new TypeError('el must be an Element');
	} if (! isObject(props)) {
		throw new TypeError('props must be an object');
	} else {
		Object.entries(props).forEach(([p, v]) => {
			if (typeof v === 'string' || typeof v === 'number' || isScriptURL(v)) {
				if (typeof namespace === 'string') {
					el.setAttributeNS(namespace, p, v);
				} else {
					el.setAttribute(p, v);
				}
			} else if (typeof v === 'boolean') {
				if (typeof namespace === 'string') {
					v ? el.setAttributeNS(namespace, p, '') : el.removeAttributeNS(namespace, p);
				} else {
					el.toggleAttribute(p, v);
				}
			} else if (v instanceof Date) {
				if (typeof namespace === 'string') {
					el.setAttributeNS(namespace, p, v.toISOString());
				} else {
					el.setAttribute(p, v.toISOString());
				}
			} else if (v instanceof URL) {
				if (typeof namespace === 'string') {
					el.setAttributeNS(namespace, p, v.href);
				} else {
					el.setAttribute(p, v.href);
				}
			} else if (typeof v === 'undefined' || v === null) {
				if (typeof namespace === 'string') {
					el.removeAttributeNS(namespace, p);
				} else {
					el.removeAttribute(p);
				}
			} else if (typeof namespace === 'string') {
				el.setAttributeNS(namespace, p, JSON.stringify(v));
			} else {
				el.setAttribute(p, JSON.stringify(v));
			}
		});
	}
}

export function getBool(el, attr) {
	return el.hasAttribute(attr);
}

export function setBool(el, attr, val) {
	el.toggleAttribute(attr, val);
}

export function getInt(el, attr, {
	fallback = NaN,
	min = Number.MIN_SAFE_INTEGER,
	max = Number.MAX_SAFE_INTEGER,
} = {}) {
	if (el.hasAttribute(attr)) {
		const val = clamp(min, parseInt(el.getAttribute(attr)), max);
		return Number.isNaN(val) ? fallback : val;
	} else {
		return fallback;
	}
}

export function setInt(el, attr, val, {
	min = Number.MIN_SAFE_INTEGER,
	max = Number.MAX_SAFE_INTEGER,
} = {}) {
	if (Number.isInteger(val)) {
		el.setAttribute(attr, clamp(min, val, max));
	} else if (typeof val === 'string') {
		setInt(el, attr, parseInt(val), { min, max });
	} else {
		el.removeAttribute(attr);
	}
}

export function getFloat(el, attr, {
	fallback = NaN,
	min = Number.MIN_SAFE_INTEGER,
	max = Number.MAX_SAFE_INTEGER,
} = {}) {
	if (el.hasAttribute(attr)) {
		const val = clamp(min, parseFloat(el.getAttribute(attr)), max);
		return Number.isNaN(val) ? fallback : val;
	} else {
		return fallback;
	}
}

export function setFloat(el, attr, val, {
	min = Number.MIN_SAFE_INTEGER,
	max = Number.MAX_SAFE_INTEGER,
} = {}) {
	if (typeof val === 'number' && ! Number.isNaN(val)) {
		el.setAttribute(attr, clamp(min, val, max));
	} else if (typeof val === 'string') {
		setFloat(el, attr, parseFloat(val), { min, max });
	} else {
		el.removeAttribute(attr);
	}
}

export function getString(el, attr, { fallback = null } = {}) {
	if (el.hasAttribute(attr)) {
		return el.getAttribute(attr) || fallback;
	} else {
		return fallback;
	}
}

export function setString(el, attr, val, {
	minLength = 1,
	maxLength = Infinity,
	pattern   = null,
} = {}) {
	if (
		typeof val === 'string'
		&& between(minLength, val.length, maxLength)
		&& (!(pattern instanceof RegExp) || pattern.test(val))
	) {
		el.setAttribute(attr, val);
	} else {
		el.removeAttribute(attr);
	}
}

export function getURL(el, attr, { base = document.baseURI } = {}) {
	if (el.hasAttribute(attr)) {
		return new URL(el.getAttribute(attr), base);
	} else {
		return null;
	}
}

export function setURL(el, attr, val, {
	base = document.baseURI,
	requirePath = false,
} = {}) {
	if ((val instanceof URL) && (! requirePath || val.pathname.length > 1)) {
		el.setAttribute(attr, val.href);
	} else if (typeof val === 'string' && val.length !== 0) {
		setURL(el, attr, new URL(val, base), { requirePath });
	} else {
		el.removeAttribute(attr);
	}
}
