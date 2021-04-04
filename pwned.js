import { sha1 } from './hash.js';
import { getText } from './http.js';

export async function pwnedCount(pwd) {
	const hash = await sha1(pwd);

	const prefix = hash.substring(0,5).toUpperCase();
	const rest   = `${hash.substring(5).toUpperCase()}:`;

	try {
		const match  = await getText(new URL(`./${prefix}`, 'https://api.pwnedpasswords.com/range/'))
			.then(lines => lines.split('\r\n'))
			.then(lines => lines.find(h => h.startsWith(rest)));

		if (typeof match === 'string') {
			return parseInt(match.split(':', 2)[1]);
		} else {
			return 0;
		}
	} catch(err) {
		console.error(err);
		return 0;
	}
}

export async function pwned(pwd) {
	const found = await pwnedCount(pwd);
	return found !== 0;
}
