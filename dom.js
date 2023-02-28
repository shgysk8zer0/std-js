import { signalAborted } from './abort.js';
import { addListener, listen, loaded as whenLoaded } from './events.js';
import { getDeferred, isAsync } from './promises.js';
import { isHTML, isTrustPolicy } from './trust.js';
import { HTML } from './types.js';
import { errorToEvent, callOnce } from './utility.js';
import { data as setData, css as setCss, attr as setAttr } from './attrs.js';
import { createElement } from './elements.js';

export const readyStates = ['loading', 'interactive', 'complete'];

export const readyStateIndex = (state = document.readyState) => readyStates.indexOf(state);

export const reachedState = state => ! readyStateIndex(document.readyState) > readyStateIndex(state);

export function query(what, base = document) {
	if (Array.isArray(what)) {
		return what;
	} else if (what instanceof EventTarget) {
		return [what];
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

export function nth(what, n, { base } = {}) {
	return query(what, base).at(n);
}

export function first(what, base) {
	return nth(what, 0, { base });
}

export function last(what, base) {
	return nth(what, -1, { base });
}

export function each(what, callback, { base } = {}) {
	const items = query(what, base);
	items.forEach(callback);
	return items;
}

export function map(what, callback, { base } = {}) {
	return query(what, base).map(callback);
}

export function some(what, callback, { base } = {}) {
	return query(what, base).some(callback);
}

export function every(what, callback, { base } = {}) {
	return query(what, base).every(callback);
}

export function find(what, callback, { base } = {}) {
	return query(what, base).find(callback);
}

export function filter(what, callback, { base } = {}) {
	return query(what, base).filter(callback);
}

export function groupByToMap(what, callback, { base } = {}) {
	return query(what, base).groupByToMap(callback);
}

export function groupBy(what, callback, { base } = {}) {
	return query(what, base).groupBy(callback);
}

/**
 * @deprecated
 */
export function create(tag, { attrs = {}, ...rest } = {}) {
	console.warn('`create()` is deprecated. Please use `createElement()` instead.');
	return createElement(tag, { ...attrs, ...rest });
}

export function append(parent, ...nodes) {
	parent.append(...nodes);
}

export function remove(what, { base } = {}) {
	return each(what, item => item.remove(), { base });
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

export function css(what, props = {}, { base, priority } = {}) {
	return each(what, item => setCss(item, props, { priority }), { base });
}

export function data(what, props = {}, { base } = {}) {
	return each(what, item => setData(item, props), { base });
}

export function attr(what, props = {}, { base, namespace = null, policy } = {}) {
	return each(what, item => setAttr(item, props, { namespace, policy }), { base });
}

export function toggleAttr(what, attrs, { base, force, signal } = {}) {
	if (! Array.isArray(attrs)) {
		attrs = [attrs];
	}
	const items = query(what, base);

	if (! (signal instanceof AbortSignal)) {
		items.forEach(item => attrs.forEach(attr => item.toggleAttribute(attr, force)));
	} else if (signal.aborted) {
		items.forEach(item => attrs.forEach(attr => item.removeAttribute(attr)));
	} else {
		if (typeof force !== 'boolean') {
			force = true;
		}

		items.forEach(item => attrs.forEach(attr => item.toggleAttribute(attr, force)));

		signal.addEventListener('abort', () => {
			items.forEach(item => attrs.forEach(attr => item.toggleAttribute(attr, !force)));
		}, { once: true });
	}
	return items;
}

export function disable(what, { base, value = true } = {}) {
	return each(what, el => el.disabled = value, { base });
}

export function enable(what, { base, value = false } = {}) {
	return disable(what, { base, value });
}

export function hide(what, { base, value = true } = {}) {
	return each(what, el => el.hidden = value, { base });
}

export function unhide(what, { base, value = false } = {}) {
	return hide(what, { base, value });
}

export function value(what, value, { base } = {}) {
	if (value == null) {
		return each(what, el => el.removeAttribute('value'), { base });
	} else {
		return each(what, el => el.value = value, { base });
	}
}

export function addClass(what, ...args) {
	return each(what, el => el.classList.add(...args));
}

export function removeClass(what, ...args) {
	return each(what, el => el.classList.remove(...args));
}

export function toggleClass(what, classes = {}, { base, force } = {}) {
	return each(what, item => {
		if (typeof classes === 'string') {
			return item.classList.toggle(classes, force);
		} else if (Array.isArray(classes)) {
			classes.forEach(cn => item.classList.toggle(cn, force));
		} else {
			Object.entries(classes).forEach(([cl, cond]) => {
				if (cond instanceof Function) {
					item.classList.toggle(cl, cond.apply(what, [cl]));
				} else if (cond instanceof AbortSignal) {
					if (cond.aborted) {
						item.classList.remove(cl);
					} else {
						item.classList.add(cl, true);
						cond.addEventListener('abort', () => {
							item.classList.remove(cl);
						}, { once: true });
					}
				} else {
					item.classList.toggle(cl, cond);
				}
			});
		}
	}, { base });
}

export function replaceClass(what, classes = {}, { base } = {}) {
	const entries = Object.entries(classes);

	return each(what, item => {
		entries.forEach(([from, to]) => item.classList.replace(from, to));
	}, { base });
}

export function text(what, text, { base } = {}) {
	return each(what, el => el.textContent = text, { base });
}

export function html(what, text, {
	base,
	sanitizer,
	policy = 'trustedTypes' in globalThis ? globalThis.trustedTypes.defaultPolicy : undefined,
} = {}) {
	if (typeof sanitizer !== 'undefined' && sanitizer.setHTML instanceof Function) {
		return each(what, el => el.setHTML(text, sanitizer), base);
	} else if (typeof policy !== 'undefined' && policy.createHTML instanceof Function) {
		text = policy.createHTML(text);
		return each(what, el => el.innerHTML = text, { base });
	} else {
		return each(what, el => el.innerHTML = text, { base });
	}
}

export function on(what, when, ...args) {
	// @TODO: Figure out a way of adding `base` to arguments
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

export function prevent(what, event = 'submit', { signal, capture } = {}) {
	return on(what, event, ev => ev.preventDefault(), { signal, capture });
}

export function off(what, when, ...args) {
	return each(what, item => {
		if (typeof when === 'string') {
			item.removeEventListener(when, ...args);
		} else if (Array.isArray(when)) {
			when.forEach(e =>  item.removeEventListener(e, ...args));
		} else {
			Object.entries(when).forEach(([ev, cb]) => item.removeEventListener(ev, cb, ...args));
		}
	});
}

export async function when(what, events, { capture, passive, signal, base } = {}) {
	const controller = new AbortController();
	const { promise, resolve, reject } = getDeferred();

	if (signal instanceof AbortSignal) {
		if (signal.aborted) {
			controller.abort(signal.reason);
		} else {
			addEventListener([signal], ['abort'], () => {
				controller.abort(signal.reason);
				reject(signal.reason);
			}, { once: true, signal: controller.signal });
		}
	}

	if (controller.signal.aborted) {
		reject(controller.signal.reason);
	} else {
		on(query(what, base), events, event => {
			resolve(event);
			controller.abort();
		}, { capture, passive, signal: controller.signal });
	}

	return promise;
}

export const ready = callOnce(async function ready({ signal } = {}) {
	const { promise, resolve, reject } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason || new DOMException('Operation aborted.'));
	} else if (readyStateIndex() === 0) {
		listen(document, 'DOMContentLoaded', resolve, { signal, once: true, capture: true });

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort',
				({ target }) => reject(target.reason || new DOMException('Operation aborted.')),
				{ once: true }
			);
		}
	} else {
		resolve();
	}

	return promise;
});

export async function whenReadyState(state, { signal } = {}) {
	const { resolve, reject, promise } = getDeferred();
	const stateIndex = readyStateIndex(state);

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason || new DOMException('Operation aborted.'));
	} else if (stateIndex < 0) {
		reject(new DOMException(`Invalid state: ${state}`));
	} else if (stateIndex > readyStateIndex()) {
		const controller = new AbortController();
		let settled = false;

		controller.signal.addEventListener('abort', ({ target }) => {
			if (! settled) {
				reject(target.reason || new DOMException('Operation aborted.'));
				settled = true;
			}
		}, { once: true });

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target }) => {
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		document.addEventListener('readystatechange', () => {
			if (document.readyState === state) {
				resolve();
				settled = true;
				controller.abort();
			}
		}, { signal: controller.signal });
	} else {
		resolve();
	}

	return promise;
}

export const interactive =  callOnce(async function interactive({ signal } = {}) {
	await whenReadyState('interactive', { signal });
});

export const complete = callOnce(async function complete({ signal } = {}) {
	await whenReadyState('complete', { signal });
});

export const loaded =  callOnce(async function loaded({ signal } = {}) {
	const { promise, resolve, reject } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason || new DOMException('Operation aborted.'));
	} else if (readyStateIndex() < 2) {
		listen(globalThis, 'load', resolve, { signal, once: true, capture: true });

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort',
				({ target }) => reject(target.reason || new DOMException('Operation aborted.')),
				{ once: true }
			);
		}
	} else {
		resolve();
	}

	return promise;
});

export const unloaded = callOnce(async function unloaded({ signal } = {}) {
	const { promise, resolve } = getDeferred();
	listen(globalThis, 'unload', resolve, { signal, once: true, capture: true });
	return promise;
});

export const beforeUnload = callOnce(async function beforeUnload({ signal } = {}) {
	const { promise, resolve } = getDeferred({ signal });
	listen(globalThis, 'beforeunload', resolve, { signal, once: true, capture: true });
	return promise;
});

export const beforeInstallPrompt = callOnce(async function({ signal } = {}) {
	const { promise, resolve, reject } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason);
	} else if ('onbeforeinstallprompt' in globalThis) {
		listen(globalThis, 'beforeinstallprompt', resolve, { once: true, capture: true, signal });

		if (signal instanceof AbortSignal) {
			listen(signal, 'abort', ({ reason }) => reject(reason), { once: true });
		}
	}

	return await promise;
});

export async function whenPageVisible({ signal } = {}) {
	const { promise, resolve } = getDeferred({ signal });

	if (document.visibilityState === 'visible') {
		resolve();
	} else {
		listen(document, 'visibilitychange', () => resolve(), { once: true, signal });
	}

	return promise;
}

export async function whenPageHidden({ signal } = {}) {
	const { promise, resolve } = getDeferred({ signal });

	if (document.visibilityState === 'hidden') {
		resolve();
	} else {
		listen(document, 'visibilitychange', () => resolve(), { once: true, signal });
	}

	return promise;
}

/**
 * @deprecated [will be removed in v3.0.0]
 */
export function parseHTML(text, {
	type = HTML,
	asFrag = true,
	head = true,
	sanitizer,
	policy,
} = {}) {
	console.warn('`parseHTML` is deprecated. Please use `parse` instead');
	return parse(text, { type, asFrag, head, sanitizer, policy });
}

export function parse(text, {
	type = HTML,
	asFrag = true,
	sanitizer,
	policy = 'trustedTypes' in globalThis ? globalThis.trustedTypes.defaultPolicy : undefined,
} = {}) {
	const parser = new DOMParser();

	if (asFrag) {
		return parseAsFragment(text, { sanitizer, policy });
	} else if (isTrustPolicy(policy) && ! isHTML(text)) {
		return parser.parseFromString(policy.createHTML(text), type);
	} else {
		return parser.parseFromString(text, type);
	}
}

export function documentToFragment(doc, { sanitizer } = {}) {
	const clone = doc.cloneNode(true);
	const frag = document.createDocumentFragment();
	frag.append(...clone.head.childNodes, ...clone.body.childNodes);

	return typeof sanitizer !== 'undefined' && sanitizer.sanitize instanceof Function
		? sanitizer.sanitize(frag) : frag;
}

export function parseAsFragment(text, {
	sanitizer,
	policy = 'trustedTypes' in globalThis ? globalThis.trustedTypes.defaultPolicy : undefined,
} = {}) {
	const tmp = document.createElement('template');

	if (isTrustPolicy(policy) && ! isHTML(text)) {
		tmp.innerHTML = policy.createHTML(text);
	} else {
		tmp.innerHTML = text;
	}

	return typeof sanitizer !== 'undefined' && sanitizer.sanitize instanceof Function
		? sanitizer.sanitize(tmp.content)
		: tmp.content;
}

export function animate(what, keyframes, opts = { duration: 400 }) {
	if (opts.signal instanceof AbortSignal && opts.signal.aborted) {
		throw opts.signal.reason;
	} else if (! (Element.prototype.animate instanceof Function)) {
		throw new DOMException('Animations not supported');
	} else {
		if (Number.isInteger(opts)) {
			opts = { duration: opts };
		}

		const animations = query(what).map(item => item.animate(keyframes, opts));

		if (opts.signal instanceof AbortSignal) {
			opts.signal.addEventListener('abort', () => animations.forEach(anim => anim.cancel()), { once: true });
		}

		return animations;
	}
}

export function intersect(what, callback, { root, rootMargin, signal, threshold } = {}) {
	if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason;
	} else if (! ('IntersectionObserver' in globalThis)) {
		throw new DOMException('IntersectionObserver not supported');
	} else {
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry, index) => callback.apply(null, [entry, observer, index]));
		}, { root, rootMargin, threshold });

		each(what, item => observer.observe(item));

		if (signal instanceof AbortSignal) {
			signalAborted(signal).finally(() => observer.disconnect());
		}

		return observer;
	}
}

export function mutate(what, callback, options = {}) {
	if ('MutationObserver' in globalThis) {
		const observer = new MutationObserver((records, observer) => {
			records.forEach((record, index) => callback.apply(null, [record, observer, index]));
		});

		each(what, item => observer.observe(item, options));

		if (options.signal instanceof AbortSignal) {
			signalAborted(options.signal).finally(() => observer.disconnect());
		}

		return observer;
	} else {
		throw new Error('MutationObserver not supported');
	}
}

/**
 * @Deprecated
 */
export async function scriptLoaded(script) {
	console.warn('`scriptLoaded()` is deprecated. Use `loaded()` from `events.js` instead.');
	/*
	 * `loaded()` aliased as `whenLoaded()`
	 */
	return await whenLoaded(script);
}

/**
 * @Deprecated
 */
export async function linkLoaded(link) {
	console.warn('`linkLoaded()` is deprecated. Use `loaded()` from `events.js` instead.');
	/*
	 * `loaded()` aliased as `whenLoaded()`
	 */
	return await whenLoaded(link);
}

export function stripComments(node) {
	if (! (node instanceof Node)) {
		throw new TypeError('Cannot strip comments from non-node');
	} else {
		switch(node.nodeType) {
			case Node.ELEMENT_NODE:
			case Node.DOCUMENT_NODE:
			case Node.DOCUMENT_FRAGMENT_NODE:
				if (node.hasChildNodes()) {
					[...node.childNodes].forEach(stripComments);
				}
				break;

			case Node.COMMENT_NODE:
				node.remove();
				break;
		}
	}
}

export function supportsElement(...tags) {
	return ! tags.some(tag => document.createElement(tag) instanceof HTMLUnknownElement);
}

export function createTable(data, { caption, header, footer } = {}) {
	const table = document.createElement('table');
	if (Array.isArray(data)) {
		data.forEach(row => {
			if (Array.isArray(row)) {
				const tr = table.insertRow();
				row.forEach(cell => tr.insertCell().textContent = cell);
			}
		});
	}

	if (Array.isArray(header)) {
		const tHead = table.createTHead();
		const row = tHead.insertRow();
		row.append(...header.map(cell => {
			const th = document.createElement('th');
			th.scope = 'col';
			th.textContent = cell;
			return th;
		}));
	}

	if (Array.isArray(footer)) {
		const tFoot = table.createTFoot();
		const row = tFoot.insertRow();
		row.append(...footer.map(cell => {
			const th = document.createElement('th');
			th.textContent = cell;
			return th;
		}));
	}

	if (typeof caption === 'string') {
		table.createCaption().textContent = caption;
	}

	return table;
}

export { addListener, isAsync, errorToEvent };

