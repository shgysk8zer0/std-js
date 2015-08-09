/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL
 */
class URLx {
	constructor(urlString, baseURL) {
		if (typeof baseURL === 'string') {
			baseURL = new URL(baseURL);
		} else if (typeof baseURL === 'undefined') {
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
				searchParams: new URLSearchParams()
			};
		}
		/*https://user:pass@host.com:444/path?foo=bar#frag*/
		this.protocol = urlString.match(/^[A-z]+:/)[0] || baseURL.protocol; // https:
		this.username = '' || baseURL.username; // user
		this.password = '' || baseURL.password; // pass
		this.hostname = '' || baseURL.hostname; // host.com
		this.port = '' || baseURL.port; // 444
		this.host = `${this.hostname}${this.port ? `:${this.port}` : null}`; // host.com:444
		this.pathname = '' || baseURL.pathname; // /path
		this.search = urlString.match(/\?.*(?=#.*)/)[0] || baseURL.search; // ?foo=bar
		this.hash = urlString.match(/#.*/)[0] || baseURL.hash; // #frag
		this.origin = `${this.protocol}//${this.hostname}`; // https://host.com:444
		this.searchParams = new URLSearchParams(this.search.substring(1)) || baseURL.searchParams; // URLSearchParams()
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
if (!('URLSearchParams' in window)) {
	class URLSearchParams {
		/**
		 * Create a new instance of URLSearchParams
		 *
		 * @param  {string} search URL Search param ("foo=bar")
		 * @return URLSearchParams
		 */
		constructor(search) {
			this._params = {};
			if (typeof search === 'string') {
				search.split('&').map(param => param.split('=', 2)).forEach(
					item => this.append(item.shift(), item.shift())
				);
			}
		}

		/**
		 * Set/overwrite a value
		 *
		 * @param {string} name  Name of the property to set
		 * @param {string} value Value to set it to
		 */
		set(name, value) {
			this._params[name] = [value];
		}

		/**
		 * Set or append a property
		 *
		 * @param  {string} name  Name of the property to set
		 * @param  {string} value Value to set it to
		 *
		 * @return {void}
		 */
		append(name, value) {
			this.has(name) ? this.getAll(name).push(value) : this.set(name, value);
		}

		/**
		 * Get the first value of given property
		 *
		 * @param  {string} name Name of property to get
		 *
		 * @return {string}      Property's value or null if not set
		 */
		get(name) {
			return this.has(name) ? this._params[name][0] : null;
		}

		/**
		 * Get all values of property
		 *
		 * @param  {string} name Name of property to get
		 *
		 * @return {array}      All values for property
		 */
		getAll(name) {
			return this._params[name] || [];
		}

		/**
		 * Check whether or not property is set
		 *
		 * @param  {string}  name Property to search for
		 *
		 * @return {Boolean}      Whether or not the property is set
		 */
		has(name) {
			return this._params.hasOwnProperty(name);
		}

		/**
		 * Unsets property by name
		 *
		 * @param  {string} name Name of property to unset
		 *
		 * @return {void}
		 */
		delete(name) {
			delete this._params[name];
		}

		/**
		 * Returns the URL search params as a string
		 *
		 * @return {string} "foo=bar&bar=baz"
		 */
		toString() {
			return Object.keys(this._params).reduce((params, param) =>
				params.concat(this.getAll(param).reduce((carry, item) =>
					carry.concat(`${encodeURI(param)}=${encodeURI(item)}`)
				, []))
			, []).join('&');
		}
	}
}

console.log(new URLx('https://user:pass@example.com:444/pathname?foo=bar#hash', location.href));
