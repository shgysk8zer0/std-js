const ENDPOINT = 'https://keybase.io';
const VERSION = '1.0';

async function get(url) {
	console.info(url);
	try {
		const resp = await fetch(url, {
			mode: 'cors'
		});
		if (resp.ok) {
			const type = resp.headers.get('Content-Type');
			if (type.includes('application/json')) {
				let json = await resp.json();
				console.log(json);
				return json;
			} else if (type.includes('text/html')) {
				let html = await resp.html();
				let parser = new DOMParser();
				return parser.parse(html, 'text/html');
			} else {
				return resp.text();
			}
		} else {
			throw new Error(`<"${resp.url}"> [${resp.status}:${resp.statusText}]`);
		}
	} catch(e) {
		console.error(e);
	}
}

export default class KeyBase {
	static async getKey(user) {
		const url = new URL(`/${user}/pgp_keys.asc`, ENDPOINT);
		let resp = await get(url);
		return resp;
	}

	static async searchUsers(...users) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('usernames', users);
		let resp = await get(url);
		return resp;
	}
	static async searchTwitter(user) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('twitter', user);
		return get(url);
	}
	static async searchReddit(user) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('reddit', user);
		return get(url);
	}
	static async searchHackerNews(user) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('hackernews', user);
		return get(url);
	}
	static async searchGithub(user) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('github', user);
		return get(url);
	}
	static async searchKey(key) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('key_fingerprint', key);
		return get(url);
	}
	static async searchDomain(domain) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('domain', domain);
		return get(url);
	}
}
