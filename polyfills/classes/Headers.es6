import {normalizeName, normalizeValue} from '../../_helpers/fetch.es6';
export default class {
	constructor(headers = {}) {
		this.map = {};

		if (headers instanceof Headers) {
			headers.forEach(function(value, name) {
			this.append(name, value);
		}, this);

		} else if (headers) {
			Object.getOwnPropertyNames(headers).forEach(name => {
				this.append(name, headers[name]);
			});
		}
	}
	append(name, value) {
		name = normalizeName(name);
		value = normalizeValue(value);
		var list = this.map[name];
		if (!list) {
			list = [];
			this.map[name] = list;
		}
		list.push(value);
	}
	delete(name) {
		delete this.map[normalizeName(name)];
	}
	get(name) {
		var values = this.map[normalizeName(name)];
		return values ? values[0] : null;
	}
	getAllfunction(name) {
		return this.map[normalizeName(name)] || [];
	}
	has(name) {
		return this.map.hasOwnProperty(normalizeName(name));
	}
	set(name, value) {
		this.map[normalizeName(name)] = [normalizeValue(value)];
	}
	forEach(callback, thisArg) {
		Object.getOwnPropertyNames(this.map).forEach(name => {
			this.map[name].forEach(value => {
			callback.call(thisArg, value, name, this);
			});
		});
	}
}
