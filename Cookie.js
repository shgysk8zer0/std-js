export default class Cookie {
	static set(key, value, config = {}) {
		let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)};`;
		cookie += Object.keys(config).reduce((params, key) => {
			params.push(`${key}=${config[key]}`);
			return params;
		}, []).join(';');
		console.log(cookie);
		document.cookie = cookie;
	}

	static has(key) {
		key = encodeURIComponent(key);
		return document.cookie.split('; ').some(cookie => cookie.startsWith(`${key}=`));
	}

	static get(key) {
		const cookies = document.cookie.split('; ');
		const len = cookies.length;
		let val = null;
		key = encodeURIComponent(key);
		for (let i = 0; i < len; i++) {
			if (cookies[i].startsWith(`${key}=`)) {
				[,val = null] = cookies[i].split('=', 2);
				break;
			}
		}
		return decodeURIComponent(val);
	}

	static getAll() {
		let cookies = {};
		for (let [key, value] of Cookie.entries()) {
			cookies[key] = value;
		}
		return cookies;
	}

	static delete(key) {
		/* eslint-disable quotes */
		Cookie.set(key, null, {"max-age": 0});
	}

	static *keys() {
		const cookies = document.cookie.split('; ');
		const len = cookies.length;
		for (let i = 0; i < len; i++) {
			let [key] = cookies[i].split('=', 2);
			yield decodeURIComponent(key);
		}
	}

	static *values() {
		const cookies = document.cookie.split('; ');
		const len = cookies.length;
		for (let i = 0; i < len; i++) {
			let [, val = null] = cookies[i].split('=', 2);
			yield decodeURIComponent(val);
		}
	}

	static *entries() {
		const cookies = document.cookie.split('; ');
		const len = cookies.length;
		for (let i = 0; i < len; i++) {
			let [key, val = null] = cookies[i].split('=', 2);
			yield [decodeURIComponent(key), decodeURIComponent(val)];
		}
	}
}
