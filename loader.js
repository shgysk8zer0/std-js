import { getDeferred } from './promises.js';
import { listen } from './events.js';

function getSrcAttr(target) {
	if (! (target instanceof Element)) {
		throw new TypeError('Target must be an element');
	} else if ('src' in target) {
		return `src="${target.src}"`;
	} else if ('href' in target) {
		return `href="${target.href}"`
	} else {
		return '';
	}
}

export async function load(target, parent, srcAttr, value, { signal } = {}) {
	if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}

	if (parent instanceof Node) {
		const promise = loaded(target, { signal });
		target[srcAttr] = value;
		parent.append(target);
		return await promise;
	} else {
		target[srcAttr] = value;
		return target;
	}
}

export async function loaded(target, { signal } = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.error);
	} else {
		const controller = new AbortController();
		const opts = { once: true, signal: controller.signal };

		function load() {
			resolve(target);
			controller.abort();
		}

		function error(err) {
			if (err.error instanceof Error) {
				reject(err.error);
				controller.abort(err.error);
			} else {
				const error = new DOMException(`Error loading <${target.tagName.toLowerCase()} ${getSrcAttr(target)}>`);
				reject(error);
				controller.abort(error);
			}
		}

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target: { reason }}) => {
				reject(reason);
				controller.abort(reason);
			},{ signal: controller.signal });
		}

		if (target instanceof HTMLScriptElement && target.noModule && HTMScriptElement.supports('module')) {
			resolve(target);
		} else if (target instanceof HTMLLinkElement && target.disabled === true) {
			resolve(target);
		} else {
			listen(target, 'load', load, opts);
			listen(target, 'error', error, opts);
		}
	}
	return await promise;
}

/**
 * @deprecated
 */
export async function loadLink(...args) {
	console.warn('`loadLink()` is deprecated. Please us `createLink()` instead');
	return createLink(...args);
}

export async function createLink(href = null, {
	rel = [],
	type = null,
	as = null,
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	importance = 'auto',
	integrity = null,
	nonce = null,
	media = 'all',
	disabled = false,
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

	if (typeof importance === 'string') {
		link.importance = importance;
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

export async function preload(href, {
	as = 'fetch',
	type = null,
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	importance = 'auto',
	media = null,
	integrity = null,
	signal,
} = {}) {
	if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}

	const link = await createLink(href, {
		rel: ['preload'], as, type, crossOrigin, referrerPolicy,
		importance, media, integrity,
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

	const link = await createLink(href, { rel: ['preconnect'], crossOrigin, referrerPolicy });
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

	const link = await createLink(href, { rel: ['dsn-prefetch'], crossOrigin, referrerPolicy });
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
	type = 'text/javascript',
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	integrity = null,
	nonce = null,
	parent = document.head,
	policy,
	signal,
} = {}) {
	const script = document.createElement('script');
	script.async = async;
	script.defer = defer;
	script.type = type;
	script.noModule = noModule;
	script.crossOrigin = crossOrigin;
	script.referrerPolicy = referrerPolicy;

	if (typeof integrity === 'string') {
		script.integrity = integrity;
	}

	if (typeof nonce === 'string') {
		script.nonce = nonce;
	}
	if (policy != null && policy.createScriptURL instanceof Function) {
		await load(script, parent, 'src', policy.createScriptURL(src), { signal });
	} else {
		await load(script, parent, 'src', src, { signal });
	}

	return script;
}

export async function loadStylesheet(href, {
	rel = 'stylesheet',
	media = 'all',
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	integrity = null,
	disabled = false,
	importance = 'auto',
	title = null,
	nonce = null,
	parent = document.head,
	signal,
} = {}) {
	const link = await createLink(null, {
		rel, media, crossOrigin, referrerPolicy, integrity, disabled, importance,
		title, nonce,
	});
	/* Do not wait for load event if disabled */
	if (disabled) {
		load(link, parent, 'href', href, { signal });
		return link;
	} else {
		await load(link, parent, 'href', href,{ signal });
		return link;
	}
}

export async function loadImage(src, {
	loading = 'eager',
	decoding = 'async',
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	importance = 'auto',
	sizes = null,
	srcset = null,
	height = undefined,
	width = undefined,
	slot = null,
	part = [],
	classes = [],
	role = 'img',
	alt = '',
	signal,
} = {}) {
	if (signal instanceof AbortSignal) {
		signal.throwIfAborted();
	}

	const img = new Image(width, height);

	if (typeof loading === 'string') {
		img.loading = loading;
	}

	if (typeof decoding === 'string') {
		img.decoding = decoding;
	}

	if (typeof crossOrigin === 'string') {
		img.crossOrigin = crossOrigin;
	}

	if (typeof referrerPolicy === 'string') {
		img.referrerPolicy = referrerPolicy;
	}

	if (typeof importance === 'string') {
		img.importance = importance;
	}

	if (typeof role === 'string') {
		img.role = role;
	}

	if (Array.isArray(classes) && classes.length !== 0) {
		img.classList.add(...classes);
	}

	if (typeof srcset === 'object' && srcset !== null) {
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

	if (typeof alt === 'string') {
		img.alt = alt;
	}

	if (typeof slot === 'string') {
		img.slot = slot;
	}

	if (Array.isArray(part) && part.length !== 0 && 'part' in img) {
		img.part.add(...part);
	} else if (typeof part === 'string' && 'part' in img) {
		img.part.add(part);
	}

	/**
	 * `lazy` would make the image not start to load until appended.
	 * For this reason, we cannot wait for the `load` event because it will never occur
	 */
	if (loading === 'lazy') {
		img.src = src;
		return img;
	} else if (img.decode instanceof Function) {
		try {
			img.src = src;
			await img.decode();
			return img;
		} catch(err) {
			console.error(err);
			throw new DOMException(`Error loading image: ${img.src}`);
		}
	} else {
		const prom = loaded(img);
		img.src = src;
		return prom;
	}
}
