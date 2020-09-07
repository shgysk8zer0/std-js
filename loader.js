export async function load(target, parent, srcAttr, value) {
	if (parent instanceof Node) {
		const promise = loaded(target);
		target[srcAttr] = value;
		parent.append(target);
		return await promise;
	} else {
		target[srcAttr] = parent;
		return target;
	}
}

export async function loaded(target) {
	await new Promise((resolve, reject) => {
		function load() {
			this.removeEventListener('load', load);
			this.removeEventListener('error', error);
			resolve(target);
		}

		function error(err) {
			console.error(err);
			this.removeEventListener('load', load);
			this.removeEventListener('error', error);
			reject(err);
		}

		target.addEventListener('load', load);
		target.addEventListener('error', error);
	});
}

export async function loadLink(href = null, {
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
} = {}) {
	const link = await loadLink(href, {
		rel: ['preload'], as, type, crossOrigin, referrerPolicy,
		importance, media, integrity,
	});

	document.head.append(link);
	return link;
}

export async function preconnect(href, {
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
} = {}) {
	const link = await loadLink(href, {rel: ['preconnect'], crossOrigin, referrerPolicy });
	document.head.append(link);
	return link;
}

export async function dnsPrefetch(href, {
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
} = {}) {
	const link = await loadLink(href, {rel: ['dsn-prefetch'], crossOrigin, referrerPolicy });
	document.head.append(link);
	return link;
}

export async function prerender(href) {
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

	await load(script, parent, 'src', src);
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
} = {}) {
	const link = loadLink(null, {
		rel, media, crossOrigin, referrerPolicy, integrity, disabled, importance,
		title, nonce,
	});
	/* Do not wait for load event if disabled */
	if (disabled) {
		load(link, parent, 'href', href);
		return link;
	} else {
		await load(link, parent, 'href', href);
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
	height = null,
	width = null,
	classes = [],
	role = 'img',
	alt = '',
} = {}) {
	const img = new Image();

	if (typeof loading === 'string') {
		img.loading = loading;
	}

	if (Number.isInteger(height)) {
		img.height = height;
	}

	if (Number.isInteger(width)) {
		img.width = width;
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

	/**
	 * `lazy` would make the image not start to load until appended.
	 * For this reason, we cannot wait for the `load` event because it will never occur
	 */
	if (loading === 'lazy' || img.complete === true) {
		img.src = src;
		return img;
	} else if (img.decode instanceof Function) {
		img.src = src;
		await img.decode();
		return img;
	} else {
		return new Promise((resolve, reject) => {
			img.addEventListener('load', () => resolve(img), { once: true });
			img.addEventListener('error', (err) => reject(err), { once: true });
			img.src = src;
			img.decode().catch(console.error);
		});
	}
}
