import { signalAborted } from './abort.js';
import { addListener } from './events.js';
import { getDeferred } from './promises.js';

export async function onAnimationFrame(callback, { signal, reason = 'Operation aborted.' } = {}) {
	const { promise, resolve, reject } = getDeferred();

	const id = requestAnimationFrame(hrts => {
		if (callback instanceof Promise) {
			callback(hrts).then(resolve).catch(reject);
		} else if (callback instanceof Function) {
			try {
				resolve(callback(hrts));
			} catch (err) {
				reject(err);
			}
		} else {
			reject(new TypeError('callback must be an instance of Function or Promise'));
		}
	});

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => {
			cancelAnimationFrame(id);
			reject(reason);
		});
	}

	return await promise;
}

export async function onIdle(callback, { timeout, signal, reason = 'Operation aborted.' } = {}) {
	const { promise, resolve, reject } = getDeferred();

	const id = requestIdleCallback(hrts => {
		if (callback instanceof Promise) {
			callback(hrts).then(resolve).catch(reject);
		} else if (callback instanceof Function) {
			try {
				resolve(callback(hrts));
			} catch (err) {
				reject(err);
			}
		} else {
			reject(new TypeError('callback must be an instance of Function or Promise'));
		}
	}, { timeout });

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => {
			cancelIdleCallback(id);
			reject(reason);
		});
	}

	return await promise;
}

export function query(what, base = document) {
	if (what instanceof EventTarget) {
		return [what];
	} else if (Array.isArray(what)) {
		return what;
	} else if (typeof what === 'string') {
		const matches = Array.from(base.querySelectorAll(what));

		if (base.matches instanceof Function && base.matches(what)) {
			matches.push(base);
		}
		return matches;
	} else if (typeof what === 'object' && what[Symbol.iterator] instanceof Function) {
		return Array.from(what);
	} else {
		throw new TypeError('Invalid "what" given to query()');
	}
}

export function create(tag, {
	text = null,
	id,
	classList,
	attrs = {},
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
	styles,
	...rest
} = {}) {
	const el = document.createElement(tag, { is });

	if (typeof is === 'string') {
		attrs.is = is;
	}

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

	attr(el, { ...attrs, ...rest });

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

	if (typeof styles === 'object') {
		css(el, styles);
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

export async function css(what, props = {}, { base = document, priority = undefined } = {}) {
	return onAnimationFrame(() => {
		const items = query(what, base);

		items.forEach(item => {
			Object.entries(props).forEach(([p, v]) => {
				if (typeof v === 'string' || typeof v === 'number') {
					item.style.setProperty(p, v, priority);
				} else {
					item.style.removeProperty(p);
				}
			});
		});

		return items;
	});
}

export async function data(what, props = {}, { base = document } = {}) {
	return onAnimationFrame(() => {
		const items = query(what, base);

		items.forEach(item => {
			Object.entries(props).forEach(([p, v]) => {
				if (v instanceof Date) {
					v = v.toISOString();
				} else if (v instanceof URL) {
					v = v.href;
				}

				switch (typeof v) {
					case 'string':
					case 'number':
						item.dataset[p] = v;
						break;

					case 'boolean':
						if (v) {
							item.dataset[p] = '';
						} else {
							delete item.dataset[p];
						}
						break;

					case 'undefined':
						delete item.dataset[p];
						break;

					default:
						if (v === null) {
							delete item.dataset[p];
						} else {
							item.dataset[p] = JSON.stringify(v);
						}
				}
			});
		});

		return items;
	});
}

export async function attr(what, props = {}, { base = document, namespace = null } = {}) {
	return onAnimationFrame(() => {
		const items = query(what, base);

		items.forEach(item => {
			Object.entries(props).forEach(([p, v]) => {
				if (typeof v === 'string' || typeof v === 'number') {
					if (typeof namespace === 'string') {
						item.setAttributeNS(namespace, p, v);
					} else {
						item.setAttribute(p, v);
					}
				} else if (typeof v === 'boolean') {
					if (typeof namespace === 'string') {
						v ? item.setAttributeNS(namespace, p, '') : item.removeAttributeNS(namespace, p);
					} else {
						item.toggleAttribute(p, v);
					}
				} else if (v instanceof Date) {
					if (typeof namespace === 'string') {
						item.setAttributeNS(namespace, p, v.toISOString());
					} else {
						item.setAttribute(p, v.toISOString());
					}
				} else if (v instanceof URL) {
					if (typeof namespace === 'string') {
						item.setAttributeNS(namespace, p, v.href);
					} else {
						item.setAttribute(p, v.href);
					}
				} else if (typeof v === 'undefined' || v === null) {
					if (typeof namespace === 'string') {
						item.removeAttributeNS(namespace, p);
					} else {
						item.removeAttribute(p);
					}
				} else if (typeof namespace === 'string') {
					item.setAttributeNS(namespace, p, JSON.stringify(v));
				} else {
					item.setAttribute(p, JSON.stringify(v));
				}
			});
		});

		return items;
	});
}

export async function addClass(what, ...args) {
	return onAnimationFrame(() => query(what).forEach(el => el.classList.add(...args)));
}

export async function removeClass(what, ...args) {
	return onAnimationFrame(() => query(what).forEach(el => el.classList.remove(...args)));
}

export async function toggleClass(what, classes, { base = document, force = undefined } = {}) {
	return onAnimationFrame(() => {
		const items = query(what, base);

		items.forEach(item => {
			if (typeof classes === 'string') {
				return item.classList.toggle(classes, force);
			} else if (Array.isArray(classes)) {
				classes.forEach(cn => item.classList.toggle(cn, force));
			} else {
				Object.entries(classes).forEach(([cl, cond]) => {
					if (cond instanceof Function) {
						item.classList.toggle(cl, cond.apply(what, [cl]));
					} else {
						item.classList.toggle(cl, cond);
					}
				});
			}
		});

		return items;
	});
}

export async function text(what, text, { base = document } = {}) {
	return onAnimationFrame(() => {
		const items = query(what, base);

		items.forEach(el => el.textContent = text);

		return items;
	});
}

export async function html(what, text, { base = document } = {}) {
	return onAnimationFrame(() => {
		const items = query(what, base);

		items.forEach(el => el.innerHTML = text);

		return items;
	});
}

export function on(what, when, ...args) {
	const items = query(what);

	if (typeof when === 'string') {
		addListener(items, [when], ...args);
	} else if (Array.isArray(when)) {
		addListener(items, when, ...args);
	} else {
		Object.entries(when).forEach(([ev, cb]) => addListener(items, [ev], cb, ...args));
	}

	return items;
}

export function off(what, when, ...args) {
	const items = query(what);
	items.forEach(item => {
		if (typeof when === 'string') {
			item.removeEventListener(when, ...args);
		} else if (Array.isArray(when)) {
			when.forEach(e =>  item.removeEventListener(e, ...args));
		} else {
			Object.entries(when).forEach(([ev, cb]) => item.removeEventListener(ev, cb, ...args));
		}
	});

	return items;
}

export async function when(target, event, {
	once = true,
	capture = true,
	passive = true,
	signal,
} = {}) {
	const controller = new AbortController();

	const { promise, resolve, reject } = getDeferred();

	if (signal instanceof AbortSignal) {
		if (signal.aborted) {
			return reject(new DOMException('Operation aborted'));
		} else {
			signal.addEventListener('abort', () => {
				controller.abort();
				reject(new DOMException('Operation aborted'));
			}, { signal: controller.signal });
		}
	}

	on(target, event, resolve, { once, capture, passive, signal: controller.signal });

	return promise.then(result => {
		if (! controller.signal.aborted) {
			controller.abort();
		}

		return Promise.resolve(result);
	}).catch(reason => {
		if (! controller.signal.aborted) {
			controller.abort();
		}

		return Promise.reject(reason);
	});
}

export async function ready({ signal } = {}) {
	if (document.readyState === 'loading') {
		await when(document, 'DOMContentLoaded', { signal });
	}

}

export async function loaded({ signal } = {}) {
	if (document.readyState !== 'complete') {
		await when(window, 'load', { signal });
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

export function animate(what, keyframes, opts = { duration: 400 }) {
	if (Element.prototype.animate instanceof Function) {
		const items = query(what);

		if (Number.isInteger(opts)) {
			opts = { duration: opts };
		}

		const animations = items.map(item => item.animate(keyframes, opts));

		if (opts.signal instanceof AbortSignal) {
			signalAborted(opts.signal).finally(() => animations.forEach(anim => anim.cancel()));
		}

		return animations;
	} else {
		throw new DOMException('Animations not supported');
	}
}

export function intersect(what, callback, options = {}) {
	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry, index) => callback.apply(null, [entry, observer, index]));
		}, options);

		query(what).forEach(item => observer.observe(item));

		if (options.signal instanceof AbortSignal) {
			signalAborted(options.signal).finally(() => observer.disconnect());
		}

		return observer;
	} else {
		throw new DOMException('IntersectionObserver not supported');
	}
}

export function mutate(what, callback, options = {}) {
	if ('MutationObserver' in window) {
		const observer = new MutationObserver((records, observer) => {
			records.forEach((record, index) => callback.apply(null, [record, observer, index]));
		});

		query(what).forEach(item => observer.observe(item, options));

		if (options.signal instanceof AbortSignal) {
			signalAborted(options.signal).finally(() => observer.disconnect());
		}

		return observer;
	} else {
		throw new Error('MutationObserver not supported');
	}
}

export function supportsElement(...tags) {
	return ! tags.some(tag => document.createElement(tag) instanceof HTMLUnknownElement);
}

export { addListener };
