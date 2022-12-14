import { createIframe } from '../elements.js';

export function createKRVMaps({
	width, height, markers = [], loading = 'lazy',
	latitude = NaN, longitude = NaN, popup, tiles, target,
	maxZoom = NaN, minZoom = NaN, zoom = NaN, zoomControl = false,
	styles, dataset, slot, part,
} = {}) {
	const src = new URL('https://maps.kernvalley.us/embed');

	if (Array.isArray(markers) && markers.length !== 0) {
		src.searchParams.set('markers', markers.join('|'));
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
		height, width, referrerPolicy: 'no-referrer', loading, styles, dataset, slot, part,
	});
}

export function createKRVEvents({ theme, source, width, height, loading = 'lazy', styles, dataset, slot, part } = {}) {
	const src = new URL('https://events.kernvalley.us/embed/');

	if (typeof theme === 'string') {
		src.searchParams.set('t', theme);
	}

	if (typeof source === 'string') {
		src.searchParams.set('s', source);
	}

	return createIframe(src, {
		height, width, referrerPolicy: 'no-referrer', styles, dataset,
		sandbox: ['allow-scripts', 'allow-popups'], loading, slot, part,
	});
}

export function createWFDEvents({ theme, source, width, height, loading = 'lazy', images = false, styles, dataset, slot, part, } = {}) {
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
		height, width, referrerPolicy: 'no-referrer',
		sandbox: ['allow-scripts', 'allow-popups'], loading, styles, dataset, slot, part,
	});
}
