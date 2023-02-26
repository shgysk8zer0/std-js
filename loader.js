import { JS } from './types.js';
import { createScript, createImage, createLink } from './elements.js';
import { getDeferred } from './promises.js';

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
	type = JS,
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	integrity = null,
	nonce = null,
	fetchPriority = 'auto',
	parent = document.head,
	policy = 'trustedTypes' in globalThis ? globalThis.trustedTypes.defaultPolicy : null,
	signal,
	data = {},
} = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason);
	} else {
		const script = createScript(src, {
			async, defer, noModule, type, crossOrigin, referrerPolicy, integrity,
			nonce, fetchPriority, policy, dataset: data,
			events: {
				load: ({ target }) => resolve(target),
				error: ({ target }) => reject(new DOMException(`Error loading <script src="${target.src}">`)),
				signal,
			}
		});

		if (parent instanceof Element) {
			parent.append(script);
		} else {
			document.head.append(script);
		}

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });
		}
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
	const { resolve, reject, promise } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason);
	} else {
		const link = await createLink(href, {
			rel, media, crossOrigin, referrerPolicy, integrity, disabled, fetchPriority,
			title, nonce,
			events: {
				load: ({ target }) => resolve(target),
				error: ({ target }) => reject(new DOMException(`Error loading <link href="${target.href}">`)),
				signal,
			}
		});

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });
		}

		parent.append(link);
	}

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

	if (img.loading !== 'lazy') {
		await img.decode();
	}

	return img;
}
