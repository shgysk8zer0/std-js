import {normalizeName, normalizeValue} from '../../_helpers/fetch.js';
import Map from './Map.js';
export default class extends Map {
	constructor(headers = {}) {
		super();
		if (headers instanceof Headers) {
			headers.forEach((value, name) => {
				this.append(name, value);
			});
		} else {
			Object.getOwnPropertyNames(headers).forEach(name => {
				this.append(name, headers[name]);
			});
		}
	}
	append(name, value) {
		if (this.has(name)) {
			let values = this.getAll(name);
			name = normalizeName(name);
			value = normalizeValue(value);
			values.push(normalizeValue(value));
			super.set(name, values);
		} else {
			this.set(name, value);
		}
	}
	delete(name) {
		return super.delete(normalizeName(name));
	}
	get(name) {
		let values = super.get(normalizeName(name));
		return values ? values[0] : null;
	}
	getAll(name) {
		return super.get(normalizeName(name));
	}
	has(name) {
		return super.has(normalizeName(name));
	}
	set(name, value) {
		super.set(normalizeName(name), [normalizeValue(value)]);
	}
	// `forEach` is not in the documentation on MDN
	// forEach(callback, thisArg) {
	// 	Object.getOwnPropertyNames(this).forEach(name => {
	// 		this.getAll(name).forEach(value => {
	// 			callback.call(thisArg, value, name, this);
	// 		});
	// 	});
	// }
}
