import sha1 from './sha1.js';
import { GET } from './http.js';
const HAVE_I_BEEN_PWNED = 'https://api.pwnedpasswords.com/range/';

export default async function isPwned(pwd) {
	const hash = await sha1(pwd);

	const prefix = hash.substring(0,5).toUpperCase();
	const rest   = `${hash.substring(5).toUpperCase()}:`;
	const url    = new URL(`./${prefix}`, HAVE_I_BEEN_PWNED);

	try {
		const resp   = await GET(url);

		if (! resp.ok) {
			throw new Error(await resp.json());
		}

		const hashes  = await resp.text().then(lines => lines.split('\r\n'));
		const match = hashes.find(h => h.startsWith(rest));

		if (typeof match === 'string') {
			return parseInt(match.split(':')[1]);
		} else {
			return 0;
		}
	} catch(err) {
		console.error(err);
		return 0;
	}
}

