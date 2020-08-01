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
