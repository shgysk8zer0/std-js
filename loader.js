export async function load(target, parent, srcAttr, value) {
	const promise = loaded(target);
	target[srcAttr] = value;
	parent.append(target);
	await promise;
}

export async function loaded(target) {
	await new Promise((resolve, reject) => {
		function load() {
			this.removeEventListener('load', load);
			this.removeEventListener('error', error);
			resolve();
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
	const link = document.createElement('link');
	link.rel = rel;
	link.media = media;
	link.crossOrigin = crossOrigin;
	link.referrerPolicy = referrerPolicy;
	link.disabled = disabled;
	link.importance = importance;

	if (typeof integrity === 'string') {
		link.integrity = integrity;
	}

	if (typeof nonce === 'string') {
		link.nonce = nonce;
	}

	if (typeof title === 'string') {
		link.title = title;
	}

	/* Do not wait for load event if disabled */
	if (disabled) {
		load(link, parent, 'href', href);
	} else {
		await load(link, parent, 'href', href);
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

	if (typeof srcset === 'object') {
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
	if (loading === 'lazy') {
		img.src = src;
		return img;
	} else {
		return new Promise((resolve, reject) => {
			img.addEventListener('load', () => resolve(img), { once: true });
			img.addEventListener('error', (err) => reject(err), { once: true });
			img.src = src;
			img.decode().then(console.log, console.error);
		});
	}
}
