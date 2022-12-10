import { data, css } from './dom.js';
import { isTrustPolicy } from './trust.js';
import { isObject } from './utility.js';
import { REFERRER_POLICY } from './defaults.js';

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
} = {}) {
	const script = document.createElement('script');
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

	if (typeof script === 'string') {
		script.nonce = nonce;
	}

	if (isObject(dataset)) {
		data(script, dataset);
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
	itemprop = null,
	itemtype = null,
	itemscope = true,
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
} = {}) {
	const img = new Image(width, height);
	img.alt = alt;
	img.referrerPolicy = referrerPolicy;
	img.loading = loading;
	img.decoding = decoding;
	img.fetchPriority = fetchPriority;

	if (typeof id === 'string') {
		img.id = id;
	}

	if (typeof role === 'string') {
		img.role = role;
	}

	if (typeof crossOrigin === 'string') {
		img.crossOrigin = crossOrigin;
	}

	if (typeof itemprop === 'string') {
		img.setAttribute('itemprop', itemprop);
	}

	if (typeof itemtype === 'string') {
		img.setAttribute('itemtype', new URL(itemtype, 'https://schema.org/').href);
		img.toggleAttribute('itemscope', itemscope);
	}

	if (typeof slot === 'string') {
		img.slot = slot;
	}

	if (Array.isArray(part) && part.length !== 0 && 'part' in img) {
		img.part.add(...part);
	}

	if (Array.isArray(classList) && classList.length !== 0) {
		img.classList.add(...classList);
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

	if (isObject(dataset)) {
		data([img], dataset);
	}

	if (isObject(styles)) {
		css([img], styles);
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
}) {
	const link = document.createElement('link');

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

	if (isObject(dataset)) {
		data(link, dataset);
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
} = {}) {
	const iframe = document.createElement('iframe');
	iframe.loading = loading;
	iframe.fetchPriority = fetchPriority;
	iframe.referrerPolicy = referrerPolicy;
	iframe.frameBorder = frameBorder.toString();

	if (typeof id === 'string') {
		iframe.id = id;
	}

	if (typeof name === 'string') {
		iframe.name = name;
	}

	if (typeof title === 'string') {
		iframe.title = title;
	}

	if (typeof slot === 'string') {
		iframe.slot = slot;
	}

	if (Array.isArray(sandbox)) {
		iframe.sandbox.add(...sandbox);
	}

	if (Array.isArray(classList) && classList.length !== 0) {
		iframe.classList.add(...classList);
	}

	if (Array.isArray(part) && part.length !== 0 && 'part' in iframe) {
		iframe.part.add(...part);
	}

	if (typeof height === 'number' && ! Number.isNaN(height)) {
		iframe.height = height;
	}

	if (typeof width === 'number' && ! Number.isNaN(width)) {
		iframe.width = width;
	}

	if (Array.isArray(allow) && allow.length !== 0) {
		iframe.allow = allow.join(' ');
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
				}).join(' ');

				return `${key} ${vals}`;
			} else if (quoted.includes(val)) {
				return `${key} '${val}'`;
			} else {
				return `${key} ${val}`;
			}
		}).join('; ') + ';';
	} else if (typeof allow === 'string') {
		iframe.allow = allow;
	}

	if (typeof srcdoc === 'string' && srcdoc.length !== 0) {
		iframe.srcdoc = srcdoc;
	} else if (srcdoc instanceof Document) {
		iframe.srcdoc = srcdoc.documentElement.outerHTML.replace(/\n/g, '');
	}

	if (isObject(dataset)) {
		data([iframe], dataset);
	}

	if (isObject(styles)) {
		css([iframe], styles);
	}

	if (typeof src === 'string' || src instanceof URL) {
		iframe.src = src;
	} else if (src instanceof Document) {
		iframe.srcdoc = src.documentElement.outerHTML.replace(/\n/g,'');
	}

	return iframe;
}
