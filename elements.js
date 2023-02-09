import { data, attr, css } from './attrs.js';
import { listen } from './events.js';
import { isTrustPolicy } from './trust.js';
import { isObject, isNullish } from './utility.js';
import { REFERRER_POLICY } from './defaults.js';

export function createElement(tag, {
	/* structured data attributes        */
	'@context':    context    = 'https://schema.org',
	'@type':       type       = undefined,
	'@identifier': identifier = undefined,
	itemtype                  = undefined,
	itemprop                  = undefined,
	itemscope                 = undefined,
	itemref                   = undefined,
	itemid                    = undefined,

	/* Global attributes                  */
	id                        = undefined,
	classList                 = undefined,
	hidden                    = undefined,
	dataset                   = undefined,
	accessKey                 = undefined,
	title                     = undefined,

	/* custom element attributes          */
	part                      = undefined,
	slot                      = undefined,
	is                        = undefined,

	/* non-attribute stuff / other        */
	children                  = undefined,
	styles                    = undefined,
	text                      = undefined,
	events: { capture, passive, once, signal, ...events } = {},
	animation: {
		keyframes,
		duration = 0,
		delay = 0,
		endDelay = 0,
		easing = 'linear',
		direction = 'normal',
		fill = 'none',
		iterations = 1,
		iterationStart = 0,
		composite = 'replace',
		iterationComposite = 'replace',
		pseudoElement,
	} = {},
	...attrs
} = {}) {
	if (typeof tag !== 'string') {
		throw new TypeError('tag must be a string');
	} else {
		const el = document.createElement(tag, { is });
		el.hidden = hidden;

		if (typeof title === 'string') {
			el.title = title;
		}

		if (typeof id === 'string') {
			el.id = id;
		} else if (typeof identifier === 'string') {
			el.id = identifier;
		}

		if (Array.isArray(classList) && classList.length !== 0) {
			el.classList.add(...classList);
		}

		if (isObject(dataset)) {
			data(el, dataset);
		}

		if (Array.isArray(part) && part.length !== 0) {
			el.part.add(...part);
		} else if(typeof part === 'string') {
			el.part.add(part);
		}

		if (typeof slot === 'string') {
			el.slot = slot;
		}

		if (isObject(styles)) {
			css(el, styles);
		}

		Object.entries(events).forEach(([event, callback]) => {
			listen(el, event, callback, { capture, passive, once, signal });
		});

		if (typeof text === 'string') {
			el.textContent = text;
		}

		if (Array.isArray(children)) {
			el.append(...children.filter(el => typeof el === 'string' || el instanceof Element));
		}

		if (typeof is === 'string') {
			attrs.is = is;
		}

		if (typeof itemtype === 'string') {
			attrs.itemtype = itemtype;
		} else if (typeof type === 'string') {
			attrs.itemtype = new URL(type, context).href;
		}

		if (typeof itemprop === 'string') {
			attrs.itemprop = itemprop;
		} else if (Array.isArray(itemprop)) {
			attrs.itemprop = itemprop.join(' ');
		}

		if (typeof itemref === 'string') {
			attrs.itemref = itemref;
		} else if (Array.isArray(itemref)) {
			attrs.itemref = itemref.join(' ');
		}

		if (typeof itemscope === 'boolean' || typeof itemscope === 'string') {
			attrs.itemscope = itemscope;
		} else if (attrs.hasOwnProperty('itemtype')) {
			attrs.itemscope = true;
		}

		if (typeof itemid === 'string') {
			attrs.itemid = itemid;
		}

		if (Array.isArray(accessKey)) {
			el.accessKey = accessKey.join(' ');
		} else if (typeof accesskey === 'string') {
			el.accessKey = accessKey;
		}

		attr(el, attrs);

		if (Array.isArray(keyframes) || isObject(keyframes) && el.animate instanceof Function) {
			el.animate(keyframes, {
				duration, delay, endDelay, easing, direction, fill, iterations,
				iterationStart, composite, iterationComposite, pseudoElement,
			});
		}

		return el;
	}
}

export function createScript(src, {
	async = true,
	defer = false,
	integrity = null,
	nonce = null,
	type = 'application/javascript',
	crossOrigin = null,
	referrerPolicy = REFERRER_POLICY,
	noModule = false,
	fetchPriority = 'auto',
	dataset = null,
	policy = null,
	events: {
		capture,
		passive,
		once,
		signal,
		...events
	} = {},
	...attrs
} = {}) {
	const script = createElement('script', {
		dataset,
		events: { capture, passive, once, signal, ...events },
		...attrs,
	});
	script.type = type;
	script.noModule = noModule;
	script.async = async;
	script.defer = defer;
	script.crossOrigin = crossOrigin;
	script.referrerPolicy = referrerPolicy;
	script.fetchPriority = fetchPriority;

	if (typeof integrity === 'string') {
		script.integrity = integrity;
	}

	if (typeof nonce === 'string') {
		script.nonce = nonce;
	}

	if (isTrustPolicy(policy)) {
		script.src = policy.createScriptURL(src);
	} else {
		script.src = src;
	}

	return script;
}

export function createImage(src, {
	alt = '',
	id = null,
	height = undefined,
	width = undefined,
	crossOrigin = null,
	'@type': type,
	'@context': context,
	itemprop = null,
	itemtype = null,
	itemscope = undefined,
	sizes = null,
	srcset = null,
	referrerPolicy = REFERRER_POLICY,
	fetchPriority = 'auto',
	loading = 'eager',
	decoding = 'async',
	role = null,
	slot = null,
	part = [],
	classList = [],
	dataset = null,
	styles = null,
	events: {
		capture,
		passive,
		once,
		signal,
		...events
	} = {},
	...attrs
} = {}) {
	const img = createElement('img', {
		id, classList, dataset, slot, part, styles,
		itemtype, itemprop, itemscope, '@type': type, '@context': context,
		events: { capture, passive, once, signal, ...events },
		...attrs
	});

	if (Number.isSafeInteger(width)) {
		img.width = width;
	}

	if (Number.isSafeInteger(height)) {
		img.height = height;
	}

	img.alt = alt;
	img.referrerPolicy = referrerPolicy;
	img.loading = loading;
	img.decoding = decoding;
	img.fetchPriority = fetchPriority;

	if (typeof role === 'string') {
		img.role = role;
	}

	if (typeof crossOrigin === 'string') {
		img.crossOrigin = crossOrigin;
	}

	if (isObject(srcset)) {
		img.srcset = Object.entries(srcset).map(([size, src]) => `${src} ${size}`).join(', ');
	} else if (Array.isArray(srcset) && srcset.length !== 0) {
		img.srcset = srcset.join(', ');
	} else if (typeof srcset === 'string') {
		img.srcset = srcset;
	}

	if (Array.isArray(sizes) && sizes.length !== 0) {
		img.sizes = sizes.join(', ');
	} else if (typeof sizes === 'string') {
		img.sizes = sizes;
	}

	if (typeof src === 'string' && src.length !== 0) {
		img.src = src;
	} else if (src instanceof URL) {
		img.src = src.href;
	}

	return img;
}

export function createLink(href = null, {
	rel = [],
	type = null,
	as = null,
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	fetchPriority = 'auto',
	integrity = null,
	nonce = null,
	media = 'all',
	disabled = false,
	dataset = null,
	title = null,
	sizes = [],
	events: {
		capture,
		passive,
		once,
		signal,
		...events
	} = {},
}) {
	const link = createElement('link', {
		dataset,
		events: { capture, passive, once, signal, ...events },
	});

	if (Array.isArray(rel)) {
		link.relList.add(...rel);
	} else if (typeof rel === 'string') {
		link.relList.add(rel);
	}

	if (typeof type === 'string') {
		link.type = type;
	}

	if (typeof as === 'string') {
		link.as = as;
	}

	if (typeof crossOrigin === 'string') {
		link.crossOrigin = crossOrigin;
	}

	if (typeof referrerPolicy === 'string') {
		link.referrerPolicy = referrerPolicy;
	}

	if (typeof fetchPriority === 'string') {
		link.fetchPriority = fetchPriority;
	}

	if (typeof integrity === 'string') {
		link.integrity = integrity;
	}

	if (typeof nonce === 'string') {
		link.nonce = nonce;
	}

	if (typeof media === 'string') {
		link.media = media;
	}

	if (typeof href === 'string') {
		link.href = href;
	}

	if (disabled) {
		link.disabled = true;
	}

	if (typeof title === 'string') {
		link.title = title;
	}

	if (Array.isArray(sizes) && sizes.length !== 0) {
		link.sizes.add(...sizes);
	} else if (typeof sizes === 'string') {
		link.sizes.add(sizes);
	}

	return link;
}

export function createIframe(src, {
	name = null,
	id = null,
	width = null,
	height = null,
	srcdoc = null,
	loading = 'eager',
	frameBorder = 0,
	fetchPriority = 'auto',
	sandbox = ['allow-scripts'],
	allow = [],
	referrerPolicy = REFERRER_POLICY,
	classList = [],
	dataset = null,
	styles = null,
	part = [],
	slot = null,
	title = null,
	events: {
		capture,
		passive,
		once,
		signal,
		...events
	} = {},
} = {}) {
	const iframe = createElement('iframe', {
		id,
		classList,
		dataset,
		styles,
		part,
		slot,
		events: { capture, passive, once, signal, ...events },
	});

	iframe.loading = loading;
	iframe.fetchPriority = fetchPriority;
	iframe.referrerPolicy = referrerPolicy;
	iframe.frameBorder = frameBorder.toString();

	if (typeof name === 'string') {
		iframe.name = name;
	}

	if (typeof title === 'string') {
		iframe.title = title;
	}

	if (Array.isArray(sandbox)) {
		iframe.sandbox.add(...sandbox);
	}

	if (typeof height === 'number' && ! Number.isNaN(height)) {
		iframe.height = height;
	}

	if (typeof width === 'number' && ! Number.isNaN(width)) {
		iframe.width = width;
	}

	if (Array.isArray(allow) && allow.length !== 0) {
		iframe.allow = allow.join('; ');

		if (allow.includes('fullscreen')) {
			iframe.allowFullscreen = true;
		}
	} else if (isObject(allow)) {
		const quoted = ['self', 'none'];

		iframe.allow = Object.entries(allow).map(([key, val]) => {
			if (Array.isArray(val)) {
				const vals = val.map(item => {
					if (quoted.includes(item)) {
						return `'${item}'`;
					} else {
						return item;
					}
				}).join('; ');

				return `${key} ${vals}`;
			} else if (quoted.includes(val)) {
				return `${key} '${val}'`;
			} else {
				return `${key} ${val}`;
			}
		}).join('; ') + ';';

		if ('fullscreen' in allow) {
			iframe.allowFullscreen = true;
		}
	} else if (typeof allow === 'string') {
		iframe.allow = allow;
	}

	if (typeof srcdoc === 'string' && srcdoc.length !== 0) {
		iframe.srcdoc = srcdoc;
	} else if (srcdoc instanceof Document) {
		iframe.srcdoc = srcdoc.documentElement.outerHTML.replace(/\n/g, '');
	}

	if (typeof src === 'string' || src instanceof URL) {
		iframe.src = src;
	} else if (src instanceof Document) {
		iframe.srcdoc = src.documentElement.outerHTML.replace(/\n/g,'');
	}

	return iframe;
}

export function createOption(option) {
	if (isObject(option)) {
		const { label, value, disabled = false, selected = false, options } = option;

		if (Array.isArray(options)) {
			return createOptGroup(label, options);
		} else {
			const opt = document.createElement('option');
			opt.label = label;
			opt.value = value;
			opt.disabled = disabled;
			opt.selected = selected;
			return opt;
		}
	} else {
		const opt = document.createElement('option');
		opt.label = option;
		opt.value = option;
		return opt;
	}
}

export function createOptGroup(label, options) {
	if (typeof label !== 'string') {
		throw new TypeError('label must be a string');
	} else if (! Array.isArray(options)) {
		throw new TypeError('options must be an array');
	} else {
		const optgroup = document.createElement('optgroup');
		optgroup.label = label;
		optgroup.append(...options.map(createOption));
		return optgroup;
	}
}

export function createDatalist(id, items) {
	if (typeof id !== 'string') {
		throw new TypeError('id must be a string');
	} else if (! Array.isArray(items) || items.length == 0) {
		throw new TypeError('Items must be a non-empty array');
	} else {
		const list = document.createElement('datalist');
		list.id = id;

		list.append(...items.map(createOption));

		return list;
	}
}

export function createInput(name, {
	type = 'text',
	required = false,
	disabled = false,
	readOnly = false,
	multiple = false,
	checked = false,
	accept,
	id,
	classList,
	list,
	value,
	placeholder,
	pattern,
	inputMode,
	min = NaN,
	max = NaN,
	step = NaN,
	minLength = NaN,
	maxLength = NaN,
	autocomplete,
	styles,
	dataset,
	part,
	slot,
	events: {
		capture,
		passive,
		once,
		signal,
		...events
	} = {},
	...attrs
} = {}) {
	if (typeof name !== 'string') {
		throw new TypeError('name must be a string');
	} else {
		const input = createElement('input', {
			id,
			classList,
			dataset,
			styles,
			part,
			slot,
			events: { capture, passive, once, signal, ...events },
			...attrs
		});

		input.name = name;
		input.type = type;
		input.required = required;
		input.disabled = disabled;
		input.readOnly = readOnly;
		input.multiple = multiple;
		input.checked = checked;

		if (typeof autocomplete === 'string') {
			input.autocomplete = autocomplete;
		}

		if (typeof inputMode === 'string') {
			input.inputMode = inputMode;
		}

		if (typeof list === 'string') {
			input.setAttribute('list', list);
		}

		if (typeof placeholder === 'string') {
			input.placeholder = placeholder;
		}

		if (typeof pattern === 'string') {
			input.pattern = pattern;
		}

		if (! isNullish(min)) {
			input.min = min;
		}

		if (! isNullish(max)) {
			input.max = max;
		}

		if (Number.isSafeInteger(minLength) && minLength >= 0) {
			input.minLength = minLength;
		}

		if (Number.isSafeInteger(maxLength) && maxLength > 0) {
			input.maxLength = maxLength;
		}

		if (! isNullish(step)) {
			input.step = step;
		}

		if (! isNullish(value)) {
			input.value = value;
		}

		if (typeof accept === 'string') {
			input.accept = accept;
		} else if (Array.isArray(accept)) {
			input.accept = accept.join(',');
		}

		return input;
	}
}

export function createSelect(name, options = [], {
	required = false,
	disabled = false,
	multiple = false,
	id,
	classList,
	dataset,
	autocomplete,
	styles,
	slot,
	part,
	events: {
		capture,
		passive,
		once,
		signal,
		...events
	} = {},
	...attrs
} = {}) {
	if (typeof name !== 'string') {
		throw new TypeError('name must be a string');
	} else if (! Array.isArray(options)) {
		throw new TypeError('options must be an array');
	} else {
		const select = createElement('select', {
			id,
			classList,
			dataset,
			styles,
			part,
			slot,
			events: { capture, passive, once, signal, ...events },
			...attrs
		});
		select.name = name;
		select.multiple = multiple;
		select.disabled = disabled;
		select.required = required;
		select.append(...options.map(createOption));

		if (typeof autocomplete === 'string') {
			select.autocomplete = autocomplete;
		}

		return select;
	}
}
