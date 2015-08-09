/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL
 */
class URLx {
	constructor(urlString, baseURL) {
		if (typeof baseURL === 'string') {
			baseURL = new URL(baseURLstring);
		} else if (!baseURL instanceof URLx) {
			baseURL = {
				protocol: '',
				username: '',
				password: '',
				hostname: '',
				port: '',
				host: '',
				pathname: '',
				search: '',
				hash: '',
				origin: '',
				searchParams: {}
			};
		}
		/*https://user:pass@host.com:444/path?foo=bar#frag*/
		this.protocol = urlString.match(/^[A-z]+:/) || baseURL.protocol; // https:
		this.username = '' || baseURL.username; // user
		this.password = '' || baseURL.password; // pass
		this.hostname = '' || baseURL.hostname; // host.com
		this.port = '' || baseURL.port; // 444
		this.host = `${this.hostname}${this.port ? `:${this.port}` : null}`; // host.com:444
		this.pathname = '' || baseURL.pathname; // /path
		this.search = urlString.match(/\?.*(?=#.*)/) || baseURL.search; // ?foo=bar
		this.hash = urlString.match(/#.*/) || baseURL.hash; // #frag
		this.origin = `${this.protocol}//${this.hostname}`; // https://host.com:444
		this.searchParams = {} || baseURL.searchParams; // URLSearchParams()
		this.href = `${this.protocol}//${this.host}${this.pathname}${this.search}${this.hash}`;
		if ('dne' in this /*invalid URL*/) {
			throw new TypeError(`${urlString} is not a valid URL.`);
		}
	}
	toString() {
		return `${this.protocol}//${this.host}${this.pathname}${this.search}${this.hash}`;
	}
	static createObjectURL() {
		return;
	}

	static revokeObjectURL() {
		return;
	}
}
