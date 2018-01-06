export default class Cookie {
	static set(name, value, {
		path    = location.pathname,
		domain  = location.hostname,
		maxAge  = null,
		expires = null,
		secure  = (location.protocol === 'https:'),
	} = {}) {
		if (value === null) {
			value = '';
		}

		let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
		cookie += `;domain=${encodeURI(domain)}`;
		cookie += `;path=${encodeURI(path)}`;

		if (Number.isInteger(maxAge)) {
			cookie += `;max-age=${maxAge}`;
		}

		if (expires instanceof Date) {
			cookie += `;expires=${expires.toUTCString()}`;
		}

		if (secure) {
			cookie += ';secure';
		}

		document.cookie = cookie;
	}

	static has(name) {
		let found = false;

		for (const key of Cookie.keys()) {
			if (key === name) {
				found = true;
				break;
			}
		}
		return found;
	}

	static get(name) {
		let value = null;

		for (const [key, val] of Cookie.entries()) {
			if (name === key) {
				value = val;
				break;
			}
		}
		return value;
	}

	static getAll() {
		const cookies = {};
		for (const [key, val] of Cookie.entries()) {
			cookies[key] = val;
		}
		return cookies;
	}

	static delete(name) {
		Cookie.set(name, '', {maxAge: 0});
	}

	static clear() {
		for (const key of Cookie.keys()) {
			Cookie.delete(key);
		}
	}

	static *keys() {
		for (const[key] of Cookie.entries()) {
			yield key;
		}
	}

	static *values() {
		for (const [,val] of Cookie.entries()) {
			yield val;
		}
	}

	static *entries() {
		const cookies = document.cookie.split('; ');
		const len = cookies.length;

		for (let i = 0; i < len; i++) {
			const [key, val = ''] = cookies[i].split('=', 2);
			yield [decodeURIComponent(key), decodeURIComponent(val)];
		}
	}
}
