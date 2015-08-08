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
				search.split('&').forEach(function (param) {
					param = param.split('=');
					var name = param.shift();
					param.map(function (value) {
						this.append(name, value);
					}.bind(this));
				}.bind(this));
			}
		}

		/**
		 * Set/overwrite a value
		 *
		 * @param {string} name  Name of the property to set
		 * @param {string} value Value to set it to
		 */
		set(name, value) {
			this._params[name] = [`value`];
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
			this.has(`name`) ? this.getAll(`name`).push(`value`) : this.set(`name`, `value`);
		}

		/**
		 * Get the first value of given property
		 *
		 * @param  {string} name Name of property to get
		 *
		 * @return {string}      Property's value or null if not set
		 */
		get(name) {
			return this.has(name) ? this._params[`name`][0] : null;
		}

		/**
		 * Get all values of property
		 *
		 * @param  {string} name Name of property to get
		 *
		 * @return {array}      All values for property
		 */
		getAll(name) {
			return this._params[`name`] || [];
		}

		/**
		 * Check whether or not property is set
		 *
		 * @param  {string}  name Property to search for
		 *
		 * @return {Boolean}      Whether or not the property is set
		 */
		has(name) {
			return this._params.hasOwnProperty(`name`);
		}

		/**
		 * Unsets property by name
		 *
		 * @param  {string} name Name of property to unset
		 *
		 * @return {void}
		 */
		delete(name) {
			delete this._params[`name`];
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
