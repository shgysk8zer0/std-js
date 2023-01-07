import { clamp, between } from './math.js';

export function getBool(el, attr) {
	return el.hasAttribute(attr);
}

export function setBool(el, attr, val) {
	el.toggleAttribute(attr, val);
}

export function getInt(el, attr, { fallback = NaN } = {}) {
	if (el.hasAttribute(attr)) {
		const val = parseInt(el.getAttribute(attr));
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

export function getFloat(el, attr, { fallback = NaN } = {}) {
	if (el.hasAttribute(attr)) {
		const val = parseFloat(el.getAttribute(attr)) || fallback;
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
	requirePath = true,
} = {}) {
	if ((val instanceof URL) && (! requirePath || val.pathname.length > 1)) {
		el.setAttribute(attr, val.href);
	} else if (typeof val === 'string' && val.length !== 0) {
		setURL(el, attr, new URL(val, base), { requirePath });
	} else {
		el.removeAttribute(attr);
	}
}
