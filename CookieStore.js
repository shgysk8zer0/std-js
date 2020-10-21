/**
 * @SEE https://wicg.github.io/cookie-store/
 * @SEE https://wicg.github.io/cookie-store/explainer.html
 * @NOTE: This offers similar methods but is not a substitute
 * @TODO verify spec compliance as best as is possible
 */

function defaultParams({
	name,
	value = null,
	domain = location.hostname,
	path = '/',
	expires = null,
	sameSite = 'strict',
	secure = false,
	httpOnly = false,
}) {
	return { name, value, domain, path, expires, sameSite, secure, httpOnly };
}

function getter({ name }) {
	const encodedName = encodeURIComponent(name);
	const found = document.cookie.split(';').map(c => c.trim()).filter(c => c.startsWith(`${encodedName}=`));

	if (Array.isArray(found)) {
		return found.map(c => {
			return { name, value: decodeURIComponent(c.substr(name.length + 1)), path: undefined, domain: undefined, sameSite: undefined, expires: undefined, secure: undefined };
		});
	} else {
		return [];
	}
}

function setter({
	name,
	value,
	expires = null,
	path = '/',
	sameSite = 'strict',
	domain = null,
	secure = false,
	httpOnly = false,
}) {
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

	if (secure === true) {
		cookie += ';secure';
	}

	/**
	 * Does not work in any browser, but set regardless
	 */
	if (httpOnly === true) {
		cookie += ';httponly';
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
			const cookie = defaultParams(args[0]);
			setter(cookie);
			const event = new Event('change');
			event.changed = [cookie];
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
			const cookie = await this.get(args);

			if (typeof cookie !== 'undefined') {
				const event = new Event('change');
				cookie.expires = 1;
				cookie.value = null;
				event.changed = [];
				event.deleted = [cookie];
				this.dispatchEvent(event);
				setter({...cookie, ...args });
			} else {
				throw new Error(`Cookie not found: ${cookie.name}`);
			}
		} else {
			throw new Error('Invalid cookie params. Needs name');
		}
	}
}
