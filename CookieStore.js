/**
 * @SEE https://wicg.github.io/cookie-store/
 * @SEE https://wicg.github.io/cookie-store/explainer.html
 * @NOTE: This offers similar methods but is not a substitute and cannot get extended
 * cookie properties, such as expires, etc.
 *
 * @TODO verify spec compliance as best as is possible
 */

let onchange = null;

function getAllCookies() {
	if (document.cookie.length === 0) {
		return [];
	} else {
		return document.cookie.split(';').map(str => {
			const [name, value = null] = str.split('=');
			return {
				name: decodeURIComponent(name.trim()),
				value: typeof value === 'string' ? decodeURIComponent(value.trim()) : null,
				path: undefined,
				expires: undefined,
				domain: undefined,
				sameSite: undefined,
				secure: undefined,
			};
		});
	}
}

function defaultParams({
	name,
	value    = null,
	domain   = null,
	path     = '/',
	expires  = null,
	maxAge   = null,
	sameSite = 'strict',
	secure   = false,
	httpOnly = false,
}) {
	return { name, value, domain, path, expires, maxAge, sameSite, secure, httpOnly };
}

function getter({ name = null, value = null } = {}) {
	if (typeof name === 'string') {
		name = decodeURIComponent(name);
	}

	if (typeof value === 'string') {
		value = decodeURIComponent(value);
	}

	if (typeof name === 'string' && typeof value === 'string') {
		return getAllCookies().filter((cookie) =>
			cookie.name === name && cookie.value === value
		);
	} else if (typeof name === 'string') {
		return getAllCookies().filter(cookie => cookie.name === name);
	} else if (typeof value === 'string') {
		return getAllCookies().filter(cookie => cookie.value === value);
	} else {
		return getAllCookies();
	}
}

function setter({
	name,
	value,
	expires  = null,
	maxAge   = null,
	path     = '/',
	sameSite = 'strict',
	domain   = null,
	secure   = false,
	httpOnly = false,
}) {
	if (Number.isInteger(maxAge)) {
		setter({
			name, value, expires: Date.now() + maxAge, path, sameSite, domain, secure, httpOnly,
		});
	} else {
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
}

export default class CookieStore extends EventTarget {
	get onchange() {
		return onchange;
	}

	set onchange(callback) {
		if (callback instanceof Function) {
			this.removeEventListener('change', onchange);
			this.addEventListener('change', callback);
			onchange = callback;
		} else {
			this.removeEventListener('change', onchange);
			onchange = null;
		}
	}

	async get(args) {
		const cookies = await this.getAll(args);

		if (Array.isArray(cookies) && cookies.length !== 0) {
			return cookies[0];
		} else {
			return null;
		}
	}

	async getAll(args) {
		if (typeof args === 'string') {
			return getter({ name: args });
		} else {
			return getter(args);
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

	async delete(args = {}) {
		if (typeof args === 'string') {
			this.delete({ name: args });
		} else if (typeof args.name === 'string') {
			const cookies = await this.getAll(args);

			if (cookies.length !== 0) {
				const event = new Event('change');
				event.changed = [];
				event.deleted = new Array(cookies.length);

				cookies.forEach((cookie, i) => {
					cookie.path = args.path || '/';
					cookie.domain = args.domain || null;
					cookie.secure = args.secure || null;
					delete cookie.value;
					cookie.sameSite = args.sameSite || 'strict';

					event.deleted[i] = cookie;
					setter({...cookie, value: null, expires: 1 });
				});

				this.dispatchEvent(event);
			}
		} else {
			throw new TypeError('Failed to execute \'delete\' on \'CookieStore\': required member name is undefined.');
		}
	}
}
