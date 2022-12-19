import { createIframe } from '../elements.js';

export function createKRVMaps({
	width, height, markers = [], loading = 'lazy', locate, fullscreen,
	latitude = NaN, longitude = NaN, popup, tiles, target,
	maxZoom = NaN, minZoom = NaN, zoom = NaN, zoomControl = false,
	fetchPriority = 'auto', title, id, classList, referrerPolicy = 'no-referrer',
	styles, dataset, slot, part,
} = {}) {
	const src = new URL('https://maps.kernvalley.us/embed');
	const allow = [];

	if (Array.isArray(markers) && markers.length !== 0) {
		src.searchParams.set('markers', markers.join('|'));
	}

	if (locate) {
		src.searchParams.set('locate', '');
		allow.push('geolocation');
	}

	if (fullscreen) {
		src.searchParams.set('fullscreen', '');
		allow.push('fullscreen');
	}

	if (! Number.isNaN(longitude)) {
		src.searchParams.set('longitude', longitude.toString());
	}

	if (! Number.isNaN(latitude)) {
		src.searchParams.set('latitude', latitude);
	}

	if (typeof target === 'string') {
		src.hash = `#${target}`;
	}else if (typeof popup === 'string' && popup.length !== 0) {
		src.searchParams.set('popup', popup);
	} else if (popup instanceof HTMLElement) {
		src.searchParams.set('popup', popup.outerHTML);
	}

	if (! Number.isNaN(maxZoom)) {
		src.searchParams.set('maxZoom', maxZoom.toString());
	}

	if (! Number.isNaN(minZoom)) {
		src.searchParams.set('minZoom', minZoom.toString());
	}

	if (! Number.isNaN(zoom)) {
		src.searchParams.set('zoom', zoom.toString());
	}

	if (zoomControl) {
		src.searchParams.set('zoomControl', '');
	}

	if (typeof tiles === 'string' && tiles.length !== 0) {
		src.searchParams.set('tiles', tiles);
	}

	return createIframe(src, {
		height, width, referrerPolicy, loading, title, classList, id,
		fetchPriority, allow, sandbox: ['allow-scripts', 'allow-popups'],
		styles, dataset, slot, part,
	});
}

export function createKRVEvents({
	theme, source, width, height, loading = 'lazy',
	fetchPriority = 'auto', title, id, classList, referrerPolicy = 'no-referrer',
	styles, dataset, slot, part,
} = {}) {
	const src = new URL('https://events.kernvalley.us/embed/');

	if (typeof theme === 'string') {
		src.searchParams.set('t', theme);
	}

	if (typeof source === 'string') {
		src.searchParams.set('s', source);
	}

	return createIframe(src, {
		height, width, referrerPolicy, title, id, classList, fetchPriority, loading,
		sandbox: ['allow-scripts', 'allow-popups'], styles, dataset, slot, part,
	});
}

export function createWFDEvents({
	theme, source, width, height, loading = 'lazy', images = false,
	fetchPriority = 'auto', title, id, classList, referrerPolicy = 'no-referrer',
	styles, dataset, slot, part,
} = {}) {
	const src = new URL('https://whiskeyflatdays.com/embed/');

	if (typeof theme === 'string') {
		src.searchParams.set('theme', theme);
	}

	if (typeof source === 'string') {
		src.searchParams.set('source', source);
	}

	if (images) {
		src.searchParams.set('images', '');
	}

	return createIframe(src, {
		height, width, referrerPolicy, fetchPriority, loading, title, classList, id,
		sandbox: ['allow-scripts', 'allow-popups'], styles, dataset, slot, part,
	});
}
