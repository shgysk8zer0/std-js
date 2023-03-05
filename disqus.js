import { createScript } from './elements.js';
import { getDeferred } from './promises.js';
import { JS } from './types.js';
import { getDisqusPolicy } from './trust-policies.js';

const policyName = 'disqus#script-url';
const REFERRER_POLICY = 'origin';
const FETCH_PRIORITY = 'auto';
export const ID = 'disqus_thread';
export const trustPolicies = [policyName];

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
	link.type = JS;
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
	policy = getDisqusPolicy(),
	fetchPriority = FETCH_PRIORITY,
	events,
} = {}) {
	return createScript(policy.createScriptURL(getSiteURL(site)), {
		referrerPolicy, fetchPriority, dataset: { timestamp }, events,
	});
}

export async function loadScript(site, {
	referrerPolicy = REFERRER_POLICY,
	timestamp = Date.now(),
	policy = getDisqusPolicy(),
	fetchPriority = FETCH_PRIORITY,
	parent = document.head,
	signal,
} = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason);
	} else {
		const controller = new AbortController();

		const script = getScript(site, {
			referrerPolicy, timestamp, policy, fetchPriority,
			events: {
				load: ({ target }) => {
					resolve(target);
					controller.abort();
				},
				error: () => {
					reject(new DOMException(`Error loading Disqus script for ${site}`));
				},
				signal: controller.signal,
			}
		});

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target }) => {
				reject(target.reason);
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		parent.append(script);

		return await promise;
	}
}
