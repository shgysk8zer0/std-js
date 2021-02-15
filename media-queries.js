export function mediaQuery(query = {}) {
	if (typeof matchMedia !== 'function') {
		return false;
	} else {
		const queries = Object.entries(query).map(([k, v]) => `(${k}: ${v})`).join(' and ');
		return matchMedia(queries).matches;
	}
}

export function prefersReducedMotion() {
	return mediaQuery({ 'prefers-reduced-motion': 'reduce' });
}

export function prefersColorScheme() {
	return mediaQuery({ 'prefers-color-scheme': 'dark' }) ? 'dark': 'light';
}

export function displayMode() {
	const displays = ['browser', 'standalone', 'minimal-ui', 'fullscreen'];
	return displays.find(mode => mediaQuery({ 'display-mode': mode })) || 'browser';
}
