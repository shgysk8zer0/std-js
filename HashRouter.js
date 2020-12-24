import User from './User.js';
const routes = {};
const user = new User();

function handler({
	href,
	origin,
	pathname,
	hash,
	route,
	args,
	search,
	params,
	user,
	router,
}) {
	if (routes.hasOwnProperty(route)) {
		routes[route]({
			href,
			origin,
			pathname,
			hash,
			route,
			args,
			search,
			params,
			user,
			router,
		});
	} else if (routes.hasOwnProperty('error-page')) {
		routes['error-page']({
			href,
			origin,
			pathname,
			hash,
			route,
			args,
			search,
			params,
			user,
			router,
		});
	} else {
		throw new Error(`Invalid route for ${route}`);
	}
}

export default class HashRouter {
	static async getComponent(tag, ...args) {
		if (customElements.get(tag) === undefined) {
			await customElements.whenDefined(tag);
		}

		const El = customElements.get(tag);
		const el = new El(...args);
		return el;
	}

	static setRoute(route, callback) {
		if (typeof route === 'string' && callback instanceof Function) {
			routes[route] = callback;
		} else {
			throw new Error('Invalid route set');
		}
	}

	static get request() {
		const { pathname, hash, search, origin, href } = location;
		const [route = '', ...args] = hash.substr(1).split('/').filter(part => part !== '');
		const params = Object.fromEntries(new URLSearchParams(search).entries());

		return {
			href,
			origin,
			pathname,
			hash,
			route,
			args,
			search,
			params,
			user: HashRouter.user,
			router: HashRouter,
		};
	}

	static get routes() {
		return Object.keys(routes);
	}

	static set routes(opts = {}) {
		Object.entries(opts).forEach(([route, callback]) => HashRouter.setRoute(route, callback));
	}

	static get user() {
		return user;
	}

	static go(...path) {
		location.hash = `#${path.join('/')}`;
	}

	static init() {
		handler(HashRouter.request);
		window.addEventListener('hashchange', () => handler(HashRouter.request));
	}
}
