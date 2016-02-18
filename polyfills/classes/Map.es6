/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 */
export default class {
	constructor(obj = {}) {
		this._data = obj;
		this.size = Object.keys(this._data).length;
	}
	has(name) {
		return (name in this._data);
	}
	set(name, value) {
		return this._data[name] = value;
	}
	get(name) {
		return this.has(name) ? this._data[name] : undefined;
	}
	delete(name) {
		return delete this._data[name]
	}
	clear() {
		return this._data = {};
	}
	// *keys() {
	// 	for (let key in this._data) {
	// 		yield key;
	// 	}
	// }
	// *values() {
	// 	for (let key in this._data) {
	// 		yield this._data[key];
	// 	}
	// }
	// *entries() {
	// 	for (let key in this._data) {
	// 		yield [key, this._data[key]];
	// 	}
	// }
	forEach(callback, thisArg) {
		Object.getOwnPropertyNames(this._data).forEach(name => {
			this._data[name].forEach(value => {
			callback.call(thisArg, value, name, this);
			});
		});
	}
}
