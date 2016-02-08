export default class extends Map {
	constructor(url = '') {
		super();
		url.split('&').forEach(item => {
			let [key, value] = item.split('=');
			this.append(
				decodeURIComponent(key).replace(/\+/g, ' '),
				decodeURIComponent(value).replace(/\+/g, ' ')
			);
		});
	}
	toString() {
		console.log(this);
		let query = [];
		for (let key of this.keys()) {
			this.getAll(key).forEach(value => {
				query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
			});
		}
		return query.join('&').replace(/%20/g, '+');
	}
	set(key, value) {
		return super.set(key, [value]);
	}
	append(key, value) {
		if (this.has(key)) {
			let values = super.get(key);
			values.push(value);
			return super.set(key, values);
		} else {
			return this.set(key, value);
		}
	}
	get(key) {
		return super.get(key)[0];
	}
	getAll(key) {
		return this.has(key) ? super.get(key) : [];
	}
	*values() {
		for (let key of this.keys()) {
			yield this.get(key);
		}
	}
	*entries() {
		for (let key of this.keys()) {
			yield [key, this.get(key)];
		}
	}
}
