import sha1 from './sha1.js';
const HAVE_I_BEEN_PWNED = 'https://api.pwnedpasswords.com/range/';

export default async function isPwned(pwd) {
	const hash = await sha1(pwd);

	const prefix = hash.substring(0,5);
	const rest   = hash.substring(5);
	const url    = new URL(`./${prefix}`, HAVE_I_BEEN_PWNED);
	const resp   = await fetch(url, {
		method:         'GET',
		mode:           'cors',
		referrer:       'no-referrer',
		referrerPolicy: 'no-referrer',
		credentials:    'omit',
	});

	if (resp.ok) {
		const hashes  = await resp.text();
		const matches = hashes.split('\r\n').filter(h => h.startsWith(`${rest}:`));

		return matches.length === 0 ? 0 : parseInt(matches[0].split(':')[1]);
	} else {
		return 0;
	}
}

