const ENDPOINT = 'https://keybase.io';
const VERSION = '1.0';

export default class KeyBase {
	static async getKey(user) {
		const url = new URL(`/${user}/pgp_keys.asc`, ENDPOINT);
		try {
			const resp = await fetch(url, {mode: 'cors'});
			if (resp.ok) {
				const json = await resp.json();
				return json;
			} else {
				throw new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`);
			}
		} catch(err) {
			console.error(err);
		}
	}

	static async searchUsers(...users) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('usernames', users);
		try {
			const resp = await fetch(url, {mode: 'cors'});
			if (resp.ok) {
				const json = await resp.json();
				return json;
			} else {
				throw new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`);
			}
		} catch(err) {
			console.error(err);
		}
	}
	static async searchTwitter(user) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('twitter', user);
		try {
			const resp = await fetch(url, {mode: 'cors'});
			if (resp.ok) {
				const json = await resp.json();
				return json;
			} else {
				throw new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`);
			}
		} catch(err) {
			console.error(err);
		}
	}
	static async searchReddit(user) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('reddit', user);
		try {
			const resp = await fetch(url, {mode: 'cors'});
			if (resp.ok) {
				const json = await resp.json();
				return json;
			} else {
				throw new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`);
			}
		} catch(err) {
			console.error(err);
		}
	}
	static async searchHackerNews(user) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('hackernews', user);
		try {
			const resp = await fetch(url, {mode: 'cors'});
			if (resp.ok) {
				const json = await resp.json();
				return json;
			} else {
				throw new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`);
			}
		} catch(err) {
			console.error(err);
		}
	}
	static async searchGithub(user) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('github', user);
		try {
			const resp = await fetch(url, {mode: 'cors'});
			if (resp.ok) {
				const json = await resp.json();
				return json;
			} else {
				throw new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`);
			}
		} catch(err) {
			console.error(err);
		}
	}
	static async searchKey(key) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('key_fingerprint', key);
		try {
			const resp = await fetch(url, {mode: 'cors'});
			if (resp.ok) {
				const json = await resp.json();
				return json;
			} else {
				throw new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`);
			}
		} catch(err) {
			console.error(err);
		}
	}
	static async searchDomain(domain) {
		const url = new URL(`/_/api/${VERSION}/user/lookup.json`, ENDPOINT);
		url.searchParams.set('domain', domain);
		try {
			const resp = await fetch(url, {mode: 'cors'});
			if (resp.ok) {
				const json = await resp.json();
				return json;
			} else {
				throw new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`);
			}
		} catch(err) {
			console.error(err);
		}
	}
}
