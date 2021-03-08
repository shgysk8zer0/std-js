import { loadScript } from './loader.js';

window.dataLayer = window.dataLayer || [];

export async function ready(timeout = 2000) {
	await new Promise((resolve, reject) => {
		if (! hasGa()) {
			reject(new Error('Google Analytics script not loaded'));
		} else {
			setTimeout(() => reject(new Error('GA ready callback timed-out')), timeout);
			window.ga(() => resolve());
		}
	});
}

export function getUTMParams(search = window.location.search) {
	const params = new URLSearchParams(search);
	return  {
		source: params.get('utm_source'),
		medium: params.get('utm_medium'),
		campaign: params.get('utm_campaign'),
		term: params.get('utm_term'),
		content: params.get('utm_content'),
	};
}

export function ga(...args) {
	if (hasGa()) {
		return window.ga(...args);
	}
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
	return await getTracker(timeout).then(tracker => {
		return tracker.get(prop);
	});
}

export async function getTracker(timeout = 150) {
	if (hasGa()) {
		return await new Promise(async (resolve, reject) => {
			setTimeout(() => reject(new Error('Timeout obtaining tracker')), timeout);
			window.ga(tracker => {
				if (typeof tracker !== 'undefined') {
					resolve(tracker);
				} else {
					reject(new Error('Unable to obtain GA tracker'));
				}
			});
		});
	} else {
		new Error('Google Analytics script not loaded');
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

export async function importGa(id, params = {}) {
	const url = new URL('https://www.googletagmanager.com/gtag/js');
	url.searchParams.set('id', id);
	Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

	await loadScript(url.href, {
		crossOrigin: 'use-credentials',
	}).then(() => {
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
		send({
			hitType: this.dataset.hitType || 'event',
			eventCategory: this.dataset.eventCategory || 'unknown',
			eventLabel: this.dataset.eventLabel || 'unknown',
			transport: this.dataset.transport || 'beacon',
		});
	}
}
