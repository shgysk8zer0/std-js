if (!('URLSearchParams' in window)) {
	class URLSearchParams {
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
		set(name, value) {
			this._params[name] = [value];
		}
		append(name, value) {
			this.has(name) ? this.getAll(name).push(value) : this.set(name, value);
		}
		get(name) {
			return this.has(name) ? this._params[name][0] : null;
		}
		getAll(name) {
			return this._params[name] || [];
		}
		has(name) {
			return this._params.hasOwnProperty(name);
		}
		delete(name) {
			delete this._params[name];
		}
		toString() {
			return Object.keys(this._params).reduce((params, param) =>
				params.concat(this.getAll(param).reduce((carry, item) =>
					carry.concat(`${encodeURI(param)}=${encodeURI(item)}`)
				, []))
			, []).join('&');
		}
	}
}
