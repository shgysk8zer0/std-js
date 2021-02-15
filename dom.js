export function create(tag, {
	text = null,
	id,
	classList,
	attrs,
	dataset,
	hidden,
	title,
	accessKey,
	slot,
	is,
	part,
	identifier,
	'@context': context = 'https://schema.org',
	'@type': type = null,
	itemscope = '',
	itemprop = null,
	itemid,
	itemref,
	children,
	events,
} = {}) {
	const el = document.createElement(tag, { is });

	if (typeof id === 'string') {
		el.id = id;
	} else if (typeof identifier === 'string') {
		el.id = identifier;
	}

	if (Array.isArray(classList)) {
		el.classList.add(...classList);
	}

	if (typeof type === 'string') {
		attr(el, {
			itemtype: new URL(type, context).href,
			itemscope,
			itemid,
		});
	}

	if (typeof title === 'string') {
		el.title = title;
	}

	if (Array.isArray(accessKey)) {
		el.accessKey = accessKey.join(' ');
	} else if (typeof accesskey === 'string') {
		el.accessKey = accessKey;
	}

	if (typeof text === 'string') {
		el.textContent = text;
	}

	if (typeof attrs === 'object') {
		attr(el, attrs);
	}

	if (typeof dataset === 'object') {
		data(el, dataset);
	}

	if (typeof itemprop === 'string') {
		el.setAttribute('itemprop', itemprop);
	} else if (Array.isArray(itemprop)) {
		el.setAttribute('itemprop', itemprop.join(' '));
	}

	if (Array.isArray(children)) {
		el.append(...children.filter(el => typeof el === 'string' || el instanceof Element));
	}

	if (typeof slot === 'string') {
		el.slot = slot;
	}

	if (Array.isArray(part)) {
		'part' in el ? el.part.add(...part) : el.setAttribute('part', part.join(' '));
	}

	if (typeof hidden === 'boolean') {
		el.hidden = hidden;
	}

	if (typeof events === 'object') {
		on(el, events);
	}

	if (typeof itemref === 'string') {
		el.setAttribute('itemref', itemref);
	} else if (Array.isArray(itemref)) {
		el.setAttribute('itemref', itemref.join(' '));
	}

	return el;
}

export function meta({ name, itemprop, property, charset, content }) {
	const meta = document.createElement('meta');
	if (typeof name === 'string') {
		meta.name = name;
		meta.content = content;
	} else if (typeof itemprop === 'string') {
		meta.setAttribute('itemprop', itemprop);
		meta.content = content;
	} else if (typeof property === 'string') {
		meta.setAttribute('property', property);
		meta.content = content;
	} else if (typeof charset === 'string') {
		meta.setAttribute('charset', charset);
	} else {
		throw new Error('Meta must have either name, itemprop, property, or charset given');
	}
	return meta;
}

export function css(what, props = {}, { base = document, priority = undefined } = {}) {
	if (what instanceof Element) {
		Object.entries(props).forEach(([p, v]) => {
			if (typeof v === 'string' || typeof v === 'number') {
				what.style.setProperty(p, v, priority);
			} else {
				what.style.removeProperty(p);
			}
		});
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => css(el, props, { base, priority }));
	} else if (typeof what === 'string') {
		css(base.querySelectorAll(what), props, { base, priority });
	}
}

export function data(what, props = {}, { base = document } = {}) {
	if (what instanceof Element) {
		Object.entries(props).forEach(([p, v]) => {
			if (v instanceof Date) {
				v = v.toISOString();
			} else if (v instanceof URL) {
				v = v.href;
			}

			switch (typeof v) {
				case 'string':
				case 'number':
					what.dataset[p] = v;
					break;

				case 'boolean':
					if (v) {
						what.dataset[p] = '';
					} else {
						delete what.dataset[p];
					}
					break;

				case 'undefined':
					delete what.dataset[p];
					break;

				default:
					if (v === null) {
						delete what.dataset[p];
					} else {
						what.dataset[p] = JSON.stringify(v);
					}
			}
		});
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => data(el, props, { base }));
	} else if (typeof what === 'string') {
		data(base.querySelectorAll(what), props);
	}
}

export function attr(what, props = {}, { base = document, namespace = null } = {}) {
	if (what instanceof Element) {
		Object.entries(props).forEach(([p, v]) => {
			if (typeof v === 'string' || typeof v === 'number') {
				if (typeof namespace === 'string') {
					when.setAttributeNS(namespace, p, v);
				} else {
					what.setAttribute(p, v);
				}
			} else if (typeof v === 'boolean') {
				if (typeof namespace === 'string') {
					v ? what.setAttributeNS(namespace, p, '') : what.removeAttributeNS(namespace, p);
				} else {
					what.toggleAttribute(p, v);
				}
			} else if (v instanceof Date) {
				if (typeof namespace === 'string') {
					what.setAttributeNS(namespace, p, v.toISOString());
				} else {
					what.setAttribute(p, v.toISOString());
				}
			} else if (v instanceof URL) {
				if (typeof namespace === 'string') {
					what.setAttributeNS(namespace, p, v.href);
				} else {
					what.setAttribute(p, v.href);
				}
			} else if (typeof v === 'undefined' || v === null) {
				if (typeof namespace === 'string') {
					what.removeAttributeNS(namespace, p);
				} else {
					what.removeAttribute(p);
				}
			} else if (typeof namespace === 'string') {
				what.setAttributeNS(namespace, p, JSON.stringify(v));
			} else {
				what.setAttribute(p, JSON.stringify(v));
			}
		});
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => attr(el, props, { base, namespace }));
	} else if (typeof what === 'string') {
		attr(base.querySelectorAll(what), props, { namespace });
	}
}

export function toggleClass(what, classes, { base = document, force = undefined } = {}) {
	if (what instanceof Element) {
		if (typeof classes === 'string') {
			what.classList.toggle(classes, force);
		} else if (Array.isArray(classes)) {
			classes.forEach(cn => toggleClass(what, cn, { force }));
		} else {
			Object.entries(classes).forEach(([cl, cond]) => {
				if (cond instanceof Function) {
					what.classList.toggle(cl, cond.apply(what, [cl]));
				} else {
					what.classList.toggle(cl, cond);
				}
			});
		}
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => toggleClass(el, classes, { force }));
	} else if (typeof what === 'string') {
		toggleClass(base.querySelectorAll(what), classes, { force });
	}
}

export function on(what, when, ...args) {
	if (what instanceof Element) {
		if (typeof when === 'string') {
			what.addEventListener(when, ...args);
		} else if (Array.isArray(when)) {
			when.forEach(e => on(what, e, ...args));
		} else {
			Object.entries(when).forEach(([ev, cb]) => on(what, ev, cb, ...args));
		}
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => on(el, when, ...args));
	} else if (typeof what === 'string') {
		on(document.querySelectorAll(what), when, ...args);
	}
}

export function off(what, when, ...args) {
	if (what instanceof Element) {
		if (typeof when === 'string') {
			what.removeEventListener(when, ...args);
		} else if (Array.isArray(when)) {
			when.forEach(e => off(what, e, ...args));
		} else {
			Object.entries(when).forEach(([ev, cb]) => off(what, ev, cb, ...args));
		}
	} else if (what instanceof NodeList || what instanceof Set || Array.isArray(what)) {
		what.forEach(el => off(el, when, ...args));
	} else if (typeof what === 'string') {
		off(document.querySelectorAll(what), when, ...args);
	}
}

export async function when(target, event, {
	once = true,
	capture = true,
	passive = true,
} = {}) {
	await new Promise(resolve => on(target, event, resolve, { once, capture, passive }));
}

export async function ready() {
	if (document.readyState === 'loading') {
		await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
	}

}

export async function loaded() {
	if (document.readyState !== 'complete') {
		await new Promise(r => window.addEventListener('load', r, { once: true }));
	}
}

export function parseHTML(text, { type = 'text/html', asFrag = true, head = true } = {}) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(text, type);

	if (asFrag === false) {
		return doc;
	} else if (head === false) {
		const frag = document.createDocumentFragment();
		[...doc.body.childNodes].forEach(el => frag.append(el));
		return frag;
	} else {
		const frag = document.createDocumentFragment();
		[...doc.head.childNodes, ...doc.body.childNodes].forEach(el => frag.append(el));
		return frag;
	}
}
