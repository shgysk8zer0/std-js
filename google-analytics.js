/* global ga */
import { loadScript } from './loader.js';

window.dataLayer = window.dataLayer || [];

export function gtag() {
	window.dataLayer.push(arguments);
}

export async function importGa(id, params = {}) {
	const url = new URL('https://www.googletagmanager.com/gtag/js');
	url.searchParams.set('id', id);
	Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

	await loadScript(url.href, {
		crossOrigin: 'include-credentials',
	}).then(() => {
		gtag('js', new Date());
		gtag('config', id);
	});

	return gtag;
}

export function externalHandler() {
	ga('send', {
		hitType: 'event',
		eventCategory: 'outbound',
		eventAction: 'click',
		eventLabel: this.href,
		transport: 'beacon',
	});
}

export function telHandler() {
	ga('send', {
		hitType: 'event',
		eventCategory: 'call',
		eventLabel: this.href.replace('tel:', '').trim(),
		transport: 'beacon',
	});
}

export function mailtoHandler() {
	ga('send', {
		hitType: 'event',
		eventCategory: 'email',
		eventLabel: this.href.replace('mailto:', '').trim(),
		transport: 'beacon',
	});
}

export function geoHandler() {
	ga('send', {
		hitType: 'event',
		eventCategory: 'geo',
		eventLabel: this.href.replace('geo:', '').trim(),
		transport: 'beacon',
	});
}

export function genericHandler() {
	ga('send', {
		hitType: this.dataset.hitType || 'event',
		eventCategory: this.dataset.eventCategory || 'unknown',
		eventLabel: this.dataset.eventLabel || 'unknown',
		transport: this.dataset.transport || 'beacon',
	});
}
