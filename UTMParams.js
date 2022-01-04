export class UTMParams extends URLSearchParams {
	constructor({
		utm_campaign: campaign = undefined,
		utm_content:  content  = undefined,
		utm_medium:   medium   = undefined,
		utm_source:   source   = undefined,
		utm_term:     term     = undefined,
		...rest
	} = {}) {
		super(rest);

		if (typeof campaign === 'string') {
			this.campaign = campaign;
		}

		if (typeof content === 'string') {
			this.content = content;
		}

		if (typeof medium === 'string') {
			this.medium = medium;
		}

		if (typeof source === 'string') {
			this.source = source;
		}

		if (typeof term === 'string') {
			this.term = term;
		}
	}

	get campaign() {
		return this.get('utm_campaign');
	}

	set campaign(val) {
		if (typeof val === 'string') {
			this.set('utm_campaign', val.toLowerCase());
		} else {
			this.delete('utm_campaign');
		}
	}

	get content() {
		return this.get('utm_content');
	}

	set content(val) {
		if (typeof val === 'string') {
			this.set('utm_content', val.toLowerCase());
		} else {
			this.delete('utm_content');
		}
	}

	get medium() {
		return this.get('utm_medium');
	}

	set medium(val) {
		if (typeof val === 'string') {
			this.set('utm_medium', val.toLowerCase());
		} else {
			this.delete('utm_medium');
		}
	}

	get source() {
		return this.get('utm_source');
	}

	set source(val) {
		if (typeof val === 'string') {
			this.set('utm_source', val.toLowerCase());
		} else {
			this.delete('utm_source');
		}
	}

	get term() {
		return this.get('utm_term');
	}

	set term(val) {
		if (typeof val === 'string') {
			this.set('utm_term', val.toLowerCase());
		} else {
			this.delete('utm_term');
		}
	}

	get valid() {
		return this.has('utm_source');
	}

	clear() {
		this.delete('utm_source');
		this.delete('utm_medium');
		this.delete('utm_campaign');
		this.delete('utm_content');
		this.delete('utm_term');
	}

	setOnURL(url) {
		if (! (url instanceof URL)) {
			throw new TypeError('Not a URL object');
		} else if (this.valid) {
			url.search = new URLSearchParams({ ...Object.fromEntries(url.searchParams), ...Object.fromEntries(this) });
			return url;
		} else {
			return url;
		}
	}

	setOnLink(a) {
		if (! (a instanceof HTMLAnchorElement)) {
			throw new TypeError('setOnLink requires an `<a>`');
		} else if (this.valid) {
			a.href = this.setOnURL(new URL(a.href)).href;
		}

		return a;
	}

	static fromURL(url = location.pathname, base = location.origin) {
		const params = new URLSearchParams(url, base);
		return new UTMParams(Object.fromEntries(params));
	}
}
