import { createScript } from './elements.js';
import { loaded } from './events.js';

const TYPE = 'application/javascript';
const REFERRER_POLICY = 'origin';
const FETCH_PRIORITY = 'auto';
export const ID = 'disqus_thread';

export function getSiteURL(site) {
	return new URL('/embed.js', `https://${site}.disqus.com/`).href;
}

export function getPreload(site, {
	referrerPolicy = REFERRER_POLICY,
	fetchPriority = FETCH_PRIORITY,
} = {}) {
	const link = document.createElement('link');
	link.rel = 'preload';
	link.as = 'script';
	link.type = TYPE;
	link.referrerPolicy = referrerPolicy;
	link.fetchPriority = fetchPriority;
	link.href = getSiteURL(site);

	return link;
}

export function preload(site, {
	referrerPolicy = REFERRER_POLICY,
	fetchPriority = FETCH_PRIORITY,
	parent = document.head,
} = {}) {
	const link = getPreload(site, { referrerPolicy, fetchPriority });
	parent.append(link);
}

export function getScript(site, {
	referrerPolicy = REFERRER_POLICY,
	timestamp = Date.now(),
	policy = null,
	nonce = null,
	type = TYPE,
	noModule = false,
	fetchPriority = FETCH_PRIORITY,
} = {}) {
	return createScript(getSiteURL(site), {
		referrerPolicy, type, nonce, noModule,policy, fetchPriority, dataset: { timestamp },
	});
}

export async function loadScript(site, {
	referrerPolicy = REFERRER_POLICY,
	timestamp = Date.now(),
	policy = null,
	nonce = null,
	type = TYPE,
	noModule = false,
	fetchPriority = FETCH_PRIORITY,
	parent = document.head,
	signal,
} = {}) {
	const script = getScript(site, {
		referrerPolicy, timestamp, policy, nonce, type, noModule, fetchPriority,
	});

	const promise = loaded(script, { signal });
	parent.append(script);
	return await promise;
}
