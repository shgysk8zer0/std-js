import { sha1, HEX } from './hash.js';
import { getText } from './http.js';
import { listen } from './events.js';
const ENDPOINT = 'https://api.pwnedpasswords.com/range/';
const NL = '\r\n';

export async function pwnedCount(pwd, { signal } = {}) {
	const hash = await sha1(pwd, { output: HEX });

	const prefix = hash.substring(0, 5).toUpperCase();
	const rest   = `${hash.substring(5).toUpperCase()}:`;

	try {
		const match  = await getText(new URL(prefix, ENDPOINT), { signal })
			.then(lines => lines.split(NL).find(h => h.startsWith(rest)));

		if (typeof match === 'string') {
			return parseInt(match.split(':', 2).at(1));
		} else {
			return 0;
		}
	} catch(err) {
		globalThis.reportError(err);
		return NaN;
	}
}

export async function pwned(pwd, { signal } = {}) {
	const found = await pwnedCount(pwd, { signal });

	if (Number.isNaN(found)) {
		throw new DOMException('An error occured checking the password');
	} else {
		return found !== 0;
	}
}

export async function pwnedEventHandler() {
	if (! (this.setCustomValidity instanceof Function)) {
		return;
	} else if (this.validity.missingInput) {
		this.setCustomValidity('Password is required');
	} else if (this.validity.tooShort) {
		this.setCustomValidity(`Passwords must be at least ${this.minLength} characters long`);
	} else if (this.validity.tooLong) {
		this.setCustomValidity(`Passwords may not be longer than ${this.maxLength} characters`);
	} else if (this.validity.patternMismatch) {
		this.setCustomValidity(this.dataset.patternMessage || 'Password does not meet requirements');
	} else if (await pwned(this.value)) {
		this.setCustomValidity('Password was found in a database breach.');
	} else {
		this.setCustomValidity('');
	}
}

export function setListener(input, { event = 'change', capture = true, passive = true, signal } = {}) {
	if (! (input instanceof HTMLInputElement && input.type === 'password')) {
		throw new TypeError('`setListener()` is for `<input type="password">` only');
	} else if (input.setCustomValidity instanceof Function) {
		listen(input, event, pwnedEventHandler, { capture, passive, signal });
	}
}
