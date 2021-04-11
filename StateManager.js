/**
 * Note: This requires a specific structure of { data, title, url } for `history.state`.
 * This may cause issues with anything that uses the history API in a different manner.
 * For anything working with `history.state`, `history.state.data` should be used
 * instead, as that is where state data is stored.
 */
const KEYS = ['data', 'title', 'url'];

let instance;

function isValidState(state = history.state) {
	return state != null && KEYS.every(key => state.hasOwnProperty(key));
}

function setState(data = {}, title = document.title, url = new URL(location.href), push = false) {
	if (typeof title === 'string' && title !== document.title) {
		document.title = title;
	}

	if (! (url instanceof URL)) {
		url = new URL(url, location.href);
	}

	if (push) {
		history.pushState({ data, title, url: url.href }, title, url.href);
	} else {
		history.replaceState({ data, title, url: url.href }, title, url.href);
	}
}

function getState() {
	if (isValidState(history.state)) {
		return history.state.data;
	} else {
		return history.state || {};
	}
}

export class StateManager extends EventTarget {
	constructor() {
		super();

		if (! isValidState(history.state)) {
			setState(history.state || {}, document.title, new URL(location.href));
		}

		window.addEventListener('popstate', event => {
			event.preventDefault();

			if (isValidState(event.state)) {
				this.title = event.state.title;
			} else {
				setState(event.state || {}, document.title, location.href);
			}

			this.dispatchEvent(new Event('statechange'));
		});
	}

	get state() {
		return getState();
	}

	set state(state) {
		if (state instanceof Object) {
			this.replace({ state });
		} else {
			throw new TypeError('state must be an object');
		}
	}

	get title() {
		return document.title;
	}

	set title(newValue) {
		const oldValue = document.title;

		if (typeof newValue === 'string' && newValue !== oldValue) {
			setState(this.data, newValue, new URL(location.href));
			this.dispatchEvent(new CustomEvent('titlechange', { detail: { newValue, oldValue }}));
		}
	}

	get url() {
		return location.href;
	}

	set url(val) {
		const newValue = new URL(val, location.href);

		if (newValue !== this.url) {
			const event = new Event('urlchange');
			event.oldURL = location.href;
			event.newURL = newValue.href;
			setState(this.state, document.title, newValue);
			this.dispatchEvent(event);
		}
	}

	get urlObject() {
		return new URL(this.url);
	}

	get pathname() {
		return location.pathname;
	}

	get pathArray() {
		return this.pathname.substr(1).split('/').filter(s => s.length !== 0);
	}

	set pathname(val) {
		if (typeof val === 'string') {
			this.url = new URL(val, location.href).href;
		} else if (Array.isArray(val)) {
			this.pathname = `/${val.join('/')}`;
		}
	}

	get searchParams() {
		return this.urlObject.searchParams;
	}

	set searchParams(val) {
		if (val instanceof URLSearchParams) {
			const url = this.urlObject;
			url.search = `?${val}`;
			this.url = url.href;
		} else if (val instanceof Object) {
			this.searchParams = new URLSearchParams(val);
		} else {
			throw new TypeError('Invalid type for searchParams');
		}
	}

	get search() {
		return this.urlObject.search;
	}

	set search(val) {
		const url = this.urlObject;

		if (typeof val === 'string' || val instanceof URLSearchParams) {
			url.search = val;
		} else if (val instanceof FormData) {
			url.search = new URLSearchParams(val);
		} else if (val == null) {
			url.search = '';
		} else if (val instanceof Object) {
			url.search = new URLSearchParams(val);
		}

		this.url = url.href;
	}

	get hash() {
		return location.hash;
	}

	set hash(newValue) {
		const url = new URL(location.href);
		const event = new Event('hashchange');
		event.oldURL = location.href;
		event.oldValue = url.hash;

		if (! newValue.startsWith('#')) {
			newValue = `#${newValue}`;
		}

		url.hash = newValue;
		event.newURL = url.href;
		this.url = url.href;
		this.dispatchEvent(event);
	}

	get length() {
		return history.length;
	}

	get scrollRestoration() {
		return history.scrollRestoration;
	}

	set scrollRestoration(val) {
		history.scrollRestoration = val;
	}

	toJSON() {
		const { state, title, url, length, scrollRestoration } = this;
		return { title, url, length, scrollRestoration, state };
	}

	push({ state: newValue = this.state, title = document.title, url = new URL(location.href) } = {}) {
		setState(newValue || {}, title, url, true);
		this.dispatchEvent(new Event('statechange'));
		this.title = title;

		return this;
	}

	replace({ state: newValue = this.state || {}, title = document.title, url = new URL(location.href) } = {}) {
		setState(newValue || {}, title, url, false);
		this.dispatchEvent(new Event('statechange'));

		return this;
	}

	restore() {
		const { title } = history.state || {};
		this.dispatchEvent(new Event('beforerestore'));

		if (typeof title === 'string') {
			document.title = title;
		}

		this.dispatchEvent(new Event('restore'));
		return this;
	}

	navigate(url, { state = this.state || {}, title = document.title } = {}) {
		this.push({ url, state, title });
		return this;
	}

	get(key) {
		return this.state[key];
	}

	has(...keys) {
		const stateKeys = Object.keys(this.state);

		switch (keys.length) {
			case 0: return false;
			case 1: return stateKeys.includes[keys[0]];
			default: return keys.every(key => stateKeys.includes(key));
		}
	}

	set(key, value) {
		if (typeof value === 'undefined') {
			return this.remove(key);
		} else {
			const state = this.state;
			state[key] = value;
			this.replace({ state });
			const detail = Object.fromEntries([[key, value]]);
			this.dispatchEvent(new CustomEvent('set', { detail }));
		}

		return this;
	}

	remove(...keys) {
		const state = this.state;
		keys.forEach(key => delete state[key]);
		this.replace({ state });
		keys.forEach(detail => this.dispatchEvent(new CustomEvent('remove', { detail })));
		return this;
	}

	back() {
		this.dispatchEvent(new Event('beforeback'));
		history.back();
		this.dispatchEvent(new Event('back'));
		return this;
	}

	forward() {
		this.dispatchEvent(new Event('beforeforward'));
		history.forward();
		this.dispatchEvent(new Event('forward'));
		return this;
	}

	reload() {
		this.dispatchEvent(new Event('beforereload'));
		history.go(0);
		this.dispatchEvent(new Event('reload'));
		return this;
	}

	go(detail = 0) {
		if (Number.isInteger(detail)) {
			switch (detail) {
				case -1:
					this.back();
					break;

				case 0:
					this.reload();
					break;

				case 1:
					this.forward();
					break;

				default:
					this.dispatchEvent(new CustomEvent('beforego', { detail }));
					history.go(detail);
					this.dispatchEvent(new CustomEvent('go', { detail }));
			}

			return this;
		} else {
			throw new TypeError('`go()` only accepts integers');
		}
	}

	static init() {
		if (! isValidState(history.state)) {
			setState(history.state || {}, document.title, new URL(location.href));
			return true;
		} else {
			return false;
		}
	}
}

export function getStateManager() {
	if (typeof instance === 'undefined') {
		instance = new StateManager();
	}

	return instance;
}
