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

