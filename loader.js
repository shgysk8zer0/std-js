import { getDeferred } from './promises.js';
import { listen, loaded } from './events.js';
import { createScript, createImage, createLink } from './elements.js';

/**
 * @deprecated
 */
export async function loadLink(...args) {
	console.warn('`loadLink()` is deprecated. Please us `createLink()` instead');
	return createLink(...args);
}

export async function preload(href, {
	as = 'fetch',
	type = null,
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	fetchPriority = 'auto',
	media = null,
	integrity = null,
	signal,
} = {}) {
	if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}

	const link = createLink(href, {
		rel: ['preload'], as, type, crossOrigin, referrerPolicy,
		fetchPriority, media, integrity,
	});

	document.head.append(link);
	return link;
}

export async function preconnect(href, {
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	signal,
} = {}) {
	if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}

	const link = createLink(href, { rel: ['preconnect'], crossOrigin, referrerPolicy });
	document.head.append(link);
	return link;
}

export async function dnsPrefetch(href, {
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	signal,
} = {}) {
	if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}

	const link = createLink(href, { rel: ['dsn-prefetch'], crossOrigin, referrerPolicy });
	document.head.append(link);
	return link;
}

export async function prerender(href, { signal } = {}) {
	if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}

	const link = document.createElement('link');
	link.relList.add('prerender');
	link.href = href;
	document.head.append(link);
	return link;
}

export async function loadScript(src, {
	async = true,
	defer = false,
	noModule = false,
	type = 'application/javascript',
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	integrity = null,
	nonce = null,
	fetchPriority = 'auto',
	parent = document.head,
	policy,
	signal,
	data = {},
} = {}) {
	const script = createScript(src, {
		async, defer, noModule, type, crossOrigin, referrerPolicy, integrity,
		nonce, fetchPriority, policy, data,
	});

	const promise = loaded(script, { signal });

	if (parent instanceof Element) {
		parent.append(script);
	} else {
		document.head.append(script);
	}

	return await promise;
}

export async function loadStylesheet(href, {
	rel = 'stylesheet',
	media = 'all',
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	integrity = null,
	disabled = false,
	fetchPriority = 'auto',
	title = null,
	nonce = null,
	parent = document.head,
	signal,
} = {}) {
	const link = await createLink(href, {
		rel, media, crossOrigin, referrerPolicy, integrity, disabled, fetchPriority,
		title, nonce,
	});

	const promise = loaded(link);

	parent.append(link);

	return await promise;
}

export async function loadImage(src, {
	loading = 'eager',
	decoding = 'async',
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	fetchPriority = 'auto',
	sizes = null,
	srcset = null,
	height = undefined,
	width = undefined,
	slot = null,
	part = [],
	classes = [],
	classList = [],
	role = 'img',
	alt = '',
	signal,
} = {}) {
	if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}

	if (Array.isArray(classes) && classes.length !== 0) {
		console.warn('`classes` is deprecated. Please use `classList` instead.');
	}

	const img = createImage(src, {
		loading, decoding, crossOrigin, referrerPolicy, sizes, srcset, height,
		width, slot, part, classList: [...classList, ...classes], role, alt, fetchPriority,
	});

	await loaded(img, { signal });

	return img;
}
