/**
 * @SEE https://wicg.github.io/cookie-store/
 * @NOTE: This offers similar methods but is not a substitute
 * @TODO verify spec compliance as best as is possible
 */

function getter({ name }) {
	const encodedName = encodeURIComponent(name);
	const found = document.cookie.split(';').map(c => c.trim()).filter(c => c.startsWith(`${encodedName}=`));

	if (Array.isArray(found)) {
		return found.map(c => {
			return { name, value: decodeURIComponent(c.substr(name.length + 1)), path: undefined, domain: undefined, sameSite: undefined, expires: undefined };
		});
	} else {
		return [];
	}
}

function setter({ name, value, expires = null, path = '/', sameSite = 'strict', domain = null }) {
	let cookie = `${encodeURIComponent(name)}=`;

	if (value) {
		cookie += encodeURIComponent(value);
	}

	if (Number.isInteger(expires)) {
		cookie += `;expires=${new Date(expires).toUTCString()}`;
	} else if (expires instanceof Date) {
		cookie += `;expires=${expires.toUTCString()}`;
	}

	if (typeof path === 'string') {
		cookie += `;path=${path}`;
	}

	if (typeof domain === 'string') {
		cookie += `;domain=${domain}`;
	}

	if (typeof sameSite === 'string') {
		cookie += `;sameSite=${sameSite}`;
	}

	document.cookie = cookie;
}


export default class CookieStore extends EventTarget {
	async get(args) {
		const cookies = await this.getAll(args);

		if (Array.isArray(cookies) && cookies.length !== 0) {
			return cookies[0];
		}
	}

	async getAll(args) {
		if (typeof args === 'string') {
			return getter({ name: args });
		} else if (typeof args.name === 'string') {
			return getter(args);
		} else {
			throw new Error('No name given');
		}
	}

	async set(...args) {
		if (args.length === 1 && typeof args[0].name === 'string') {
			const { name, value, expires = undefined, path = '/', domain = null, sameSite = 'strict' } = args[0];
			setter({ name, value, expires, path, domain, sameSite });
			const event = new Event('cookiechange');
			event.changed = [{ name, value, expires, path, domain, sameSite }];
			event.deleted = [];

			this.dispatchEvent(event);
		} else if (args.length === 2) {
			this.set({ name: args[0], value: args[1] });
		} else {
			throw new Error('Invalid arguments');
		}
	}

	async delete(args) {
		if (typeof args === 'string') {
			this.delete({ name: args });
		} else if (typeof args.name === 'string') {
			const event = new Event('cookiechange');
			const { name, sameSite = 'strict', path = '/', domain = null } = args;
			setter({ name, value: '', expires: 1, path, domain, sameSite });
			event.changed = [];
			event.deleted = [{ name, value: '', expires: 1, path, domain, sameSite }];
			this.dispatchEvent(event);
		}
	}
}

window.cookieStore = new CookieStore();
