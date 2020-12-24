export default class UTM extends URL {
	constructor(url = location.href, {
		campaign = null,
		content  = null,
		medium   = null,
		source   = null,
		term     = null,
	} = {}) {
		super(url);

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

	toJSON() {
		const  { campaign, source, medium, content, term } = this;
		return { campaign, source, medium, content, term };
	}

	get campaign() {
		return this.searchParams.get('utm_campaign');
	}

	set campaign(val) {
		if (typeof val === 'string') {
			this.searchParams.set('utm_campaign', val.toLowerCase());
		} else {
			this.searchParams.delete('utm_campaign');
		}
	}

	get content() {
		return this.searchParams.get('utm_content');
	}

	set content(val) {
		if (typeof val === 'string') {
			this.searchParams.set('utm_content', val.toLowerCase());
		} else {
			this.searchParams.delete('utm_content');
		}
	}

	get medium() {
		return this.searchParams.get('utm_medium');
	}

	set medium(val) {
		if (typeof val === 'string') {
			this.searchParams.set('utm_medium', val.toLowerCase());
		} else {
			this.searchParams.delete('utm_medium');
		}
	}

	get source() {
		return this.searchParams.get('utm_source');
	}

	set source(val) {
		if (typeof val === 'string') {
			this.searchParams.set('utm_source', val.toLowerCase());
		} else {
			this.searchParams.delete('utm_source');
		}
	}

	get term() {
		return this.searchParams.get('utm_term');
	}

	set term(val) {
		if (typeof val === 'string') {
			this.searchParams.set('utm_term', val.toLowerCase());
		} else {
			this.searchParams.delete('utm_term');
		}
	}

	get valid() {
		return this.searchParams.has('utm_source');
	}

	clear(replaceState = false) {
		this.searchParams.delete('utm_source');
		this.searchParams.delete('utm_medium');
		this.searchParams.delete('utm_campaign');
		this.searchParams.delete('utm_content');
		this.searchParams.delete('utm_term');

		if (replaceState) {
			history.replaceState(history.state, document.title, this.href);
		}
		return this;
	}
}
