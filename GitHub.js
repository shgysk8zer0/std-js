const ENDPOINT = 'https://api.github.com';

function getUrl(path = [], params = {}) {
	path = `/${path.join('/')}`;
	const url = new URL(path, ENDPOINT);
	Object.keys(params).forEach(param => {
		url.searchParams.set(param, params[param]);
	});
	return url;
}

async function get(url) {
	try {
		const resp = await fetch(url, {
			method: 'cors',
			method: 'GET'
		});
		const parsed = await(parse(resp));
		if (parsed.hasOwnProperty('encoding') && parsed.encoding === 'base64') {
			parsed.content = atob(parsed.content);
		}
		return parsed;
	} catch (e) {
		console.error(e);
	}
}

async function parse(resp) {
	if (resp.ok) {
		const type = resp.headers.get('Content-Type');
		let parsed = null;

		if (type.startsWith('application/json')) {
			parsed = await resp.json();
		} else {
			let text = await resp.text();
			const parser = new DOMParser();
			parsed = parser.parseFromString(text, type);
		}
		return parsed;
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}

export default class GitHub {
	constructor(user, repo) {
		this.user = user;
		this.repo = repo;
	}

	async readme() {
		return get(new URL(`/repos/${this.user}/${this.repo}/readme`, ENDPOINT));
	}

	static async getUser(username) {
		const url = new URL(`/users/${username}`, ENDPOINT);
		return get(url);
	}

	async getContent(path) {
		return get(new URL(`/repos/${this.user}/${this.repo}/contents/${path}`, ENDPOINT));
	}

	async getIssues(params = {}, number = null) {
		let path = ['repos', this.user, this.repo, 'issues'];
		if (typeof number === 'number') {
			path.push(number);
		}
		return get(getUrl(path, params));
	}
}
