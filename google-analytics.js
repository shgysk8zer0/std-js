/**
 * @copyright 2021-2023 Chris Zuber <admin@kernvalley.us>
 */
import { loadScript } from './loader.js';
export const trustPolicies = ['goog#html'];

if (! Array.isArray(window.dataLayer)) {
	window.dataLayer = [];
}

export function ga(...args) {
	if (window.ga instanceof Function) {
		return window.ga(...args);
	}
}

export async function ready(timeout = 2000) {
	await new Promise((resolve, reject) => {
		if (! hasGa()) {
			reject(new DOMException('Google Analytics script not loaded'));
		} else {
			const id = setTimeout(() => reject(new DOMException('GA ready callback timed-out')), timeout);

			ga(() => {
				clearTimeout(id);
				resolve();
			});
		}
	});
}

export function getUTMParams(search = window.location.search) {
	const params = new URLSearchParams(search);
	return  {
		campaign: params.get('utm_campaign'),
		content: params.get('utm_content'),
		medium: params.get('utm_medium'),
		source: params.get('utm_source'),
		term: params.get('utm_term'),
	};
}

export async function create(...args) {
	await ready();
	return ga('create', ...args);
}

export async function remove() {
	await ready();
	return ga('remove');
}

export async function get(prop, timeout = 150) {
	return await getTracker(timeout).then(tracker => tracker.get(prop));
}

export async function getTracker(timeout = 150) {
	if (hasGa()) {
		return await new Promise(async (resolve, reject) => {
			const id = setTimeout(() => reject(new DOMException('Timeout obtaining tracker')), timeout);

			ga(tracker => {
				if (typeof tracker !== 'undefined') {
					clearTimeout(id);
					resolve(tracker);
				} else {
					reject(new DOMException('Unable to obtain GA tracker'));
				}
			});
		});
	} else {
		new DOMException('Google Analytics script not loaded');
	}
}

export async function set(...args) {
	await ready();
	return ga('set', ...args);
}

export async function require(...args) {
	await ready();
	return ga('require', ...args);
}

export async function provide(...args) {
	await ready();
	return ga('provide', ...args);
}

export async function location(url = window.location.href) {
	return set('page', url);
}

export async function pageView(page = window.location.pathname) {
	return send({ hitType: 'pageview', page });
}

export async function send({
	eventCategory,
	eventAction,
	eventValue,
	eventLabel,
	hitType       = 'event',
	transport     = 'beacon',
} = {}) {
	await new Promise(async(hitCallback, reject) => {
		if (hasGa()) {
			await ready();
			ga('send', { hitType, eventCategory, eventAction, eventLabel,
				eventValue, transport, hitCallback });
		} else {
			reject(new Error('ga has not been successfully initialized'));
		}
	});
}

export function gtag() {
	window.dataLayer.push(arguments);
}

export function hasGa() {
	return window.ga instanceof Function;
}

export async function importGa(id, params = {}, { policy } = {}) {
	const url = new URL('https://www.googletagmanager.com/gtag/js');
	url.searchParams.set('id', id);
	Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

	await loadScript(url.href, { crossOrigin: 'use-credentials', policy, }).then(() => {
		gtag('js', new Date());
		gtag('config', id);
		create(id, 'auto');
	}).catch(console.error);

	return { gtag, ga, send, get, set, ready, create, remove, require,
		location, pageView, getTracker, getUTMParams, hasGa };
}

export function externalHandler() {
	if (hasGa()) {
		send({
			hitType: 'event',
			eventCategory: 'outbound',
			eventAction: 'click',
			eventLabel: this.href,
			transport: 'beacon',
		});
	}
}

export function telHandler() {
	if (hasGa()) {
		send({
			hitType: 'event',
			eventCategory: 'call',
			eventLabel: this.href.replace('tel:', '').trim(),
			transport: 'beacon',
		});
	}
}

export function mailtoHandler() {
	if (hasGa()) {
		send({
			hitType: 'event',
			eventCategory: 'email',
			eventLabel: this.href.replace('mailto:', '').trim(),
			transport: 'beacon',
		});
	}
}

export function geoHandler() {
	if (hasGa()) {
		send({
			hitType: 'event',
			eventCategory: 'geo',
			eventLabel: this.href.replace('geo:', '').trim(),
			transport: 'beacon',
		});
	}
}

export function genericHandler() {
	if (hasGa()) {
		const {
			hitType = 'event', eventCategory = 'unknown', eventLabel = 'unknown',
			transport = 'beacon',
		} = this.dataset;
		send({ hitType, eventCategory, eventLabel, transport });
	}
}
