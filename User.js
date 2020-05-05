import EventTarget from './EventTarget.js';

let base = 'https://api.kernvalley.us';

async function setData(user, data) {
	user.token = data.token;
	user.identifier = data.identifier;
	user.email = data.person.email;
	user.name = data.person.name;
	user.role = data.role;
	user.set('person', JSON.stringify(data.person));

	if (data.person.image && data.person.image.url) {
		user.image = data.person.image.url;
	}
}

export default class User extends EventTarget {
	constructor() {
		super();
		this.addEventListener('login', async ({detail}) => {
			new Notification('Welcome back', {
				body: detail.person.name,
				icon: detail.person.image.url,
			});
		});

		if (this.loggedIn) {
			// Login stuff
		}
	}

	get loggedIn() {
		return this.has('token');
	}

	get role() {
		return this.get('role').then(role => {
			if (typeof role === 'string') {
				return JSON.parse(role);
			} else {
				return {};
			}
		});
	}

	set role(val) {
		this.set('role', JSON.stringify(val));
	}

	get whenLoggedIn() {
		return new Promise(async resolve => {
			if (await this.loggedIn) {
				resolve();
			} else {
				this.addEventListener('login', () => resolve(), {once: true});
			}
		});
	}

	get email() {
		return this.get('email');
	}

	set email(val) {
		this.set('email', val);
	}

	get identifier() {
		return this.get('identifier');
	}

	set identifier(val) {
		this.set('identifier', val);
	}

	get image() {
		return this.get('image');
	}

	set image(val) {
		this.set('image', val);
	}

	get name() {
		return this.get('name');
	}

	set name(val) {
		this.set('name', val);
	}

	get token() {
		return this.get('token');
	}

	set token(val) {
		this.set('token', val);
	}

	get person() {
		return this.get('person').then(person => {
			if (typeof person === 'string') {
				return JSON.parse(person);
			}
		});
	}

	async register({
		password,
		person = {},
	}) {
		const resp = await fetch(new URL('/user/', User.endpoint), {
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify({
				password,
				person,
			}),
			headers: new Headers({
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}),
		});

		if (resp.ok) {
			const detail = await resp.json();
			setData(this, detail);
			this.dispatchEvent(new CustomEvent('login', { detail }));
			return detail;
		} else {
			await customElements.whenDefined('toast-message');
			const err = await resp.json();
			console.error(err);
			const Toast = customElements.get('toast-message');
			const toast = new Toast();
			const pre = document.createElement('pre');
			const code = document.createElement('code');
			code.textContent = JSON.stringify({
				headers: Object.fromEntries(resp.headers.entries()),
				error: err,
			}, null, 4);
			pre.slot = 'content';
			pre.classList.add('overflow-auto', 'overflow-x-auto');
			pre.append(code);
			toast.append(pre);
			toast.backdrop = true;
			document.body.append(toast);
			await toast.show();
			await toast.closed;
			toast.remove();
		}
	}

	async logIn({email, password}) {
		const resp = await fetch(new URL('/user/', User.endpoint), {
			mode: 'cors',
			method: 'POST',
			body: JSON.stringify({
				email,
				password,
			}),
			headers: new Headers({
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}),
		});

		if (resp.ok) {
			const detail = await resp.json();
			setData(this, detail);
			this.dispatchEvent(new CustomEvent('login', { detail }));

			return detail;
		}
	}

	async get(prop) {
		return localStorage.getItem(prop);
	}

	async set(prop, val) {
		localStorage.setItem(prop, val);
	}

	async has(...props) {
		return props.every(prop => localStorage.hasOwnProperty(prop));
	}

	async delete(...props) {
		props.forEach(prop => localStorage.removeItem(prop));
	}

	async can(...perms) {
		const {permissions = {}} = await this.role;
		return permissions !== undefined && perms.every(perm => permissions[perm] === true);
	}

	async logOut() {
		localStorage.clear();
		this.dispatchEvent(new Event('logout'));
	}

	static get endpoint() {
		return base;
	}

	static set endpoint(val) {
		const url = new URL(val);
		base = url.href;
	}
}
