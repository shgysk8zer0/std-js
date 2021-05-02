import { sha1 } from './hash.js';
import { getText } from './http.js';
const ENDPOINT = 'https://api.pwnedpasswords.com/range/';
const NL = '\r\n';

export async function pwnedCount(pwd, { signal } = {}) {
	const hash = await sha1(pwd);

	const prefix = hash.substring(0,5).toUpperCase();
	const rest   = `${hash.substring(5).toUpperCase()}:`;

	try {
		const match  = await getText(new URL(prefix, ENDPOINT), { signal })
			.then(lines => lines.split(NL).find(h => h.startsWith(rest)));

		if (typeof match === 'string') {
			return parseInt(match.split(':', 2)[1]);
		} else {
			return 0;
		}
	} catch(err) {
		console.error(err);
		return NaN;
	}
}

export async function pwned(pwd, { signal } = {}) {
	const found = await pwnedCount(pwd, { signal });
	return found !== 0;
}

export async function pwnedEventHandler() {
	if (! (this.setCustomValidity instanceof Function)) {
		return;
	} else if (this.value.length === 0) {
		this.setCustomValidity('');
	} else if (await pwned(this.value)) {
		this.setCustomValidity('Password was found in a database breach.');
	} else {
		this.setCustomValidity('');
	}
}
