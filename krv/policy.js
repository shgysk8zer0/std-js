import { createPolicy } from '../trust.js';

export const trustedURLs = {
	maps: new URL('/embed', 'https://maps.kernvalley.us'),
	events: new URL('/embed/', 'https://events.kernvalley.us'),
	wfdEvents: new URL('/embed/', 'https://whiskeyflatdays.com'),
};

export const policy = createPolicy('krv#embed', {
	createScriptURL: input => {
		const url = new URL(input, document.baseURI);

		if (Object.values(trustedURLs).some(
			known => url.origin === known.origin && url.pathname.startsWith(known.pathname))
		) {
			return url.href;
		} else {
			throw new TypeError(`Unknown KRV embed source: ${input}`);
		}
	}
});

export const trustPolicies = [policy.name];
