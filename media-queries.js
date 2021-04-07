import { when } from './dom.js';
export const supported = window.matchMedia instanceof Function;

export function mediaQuery(query = {}) {
	console.warn('`mediaQuery()` is deprecated. Please use `matches()` instead.');
	return matches(query);
}

export function matches(what = {}) {
	return query(what).matches;
}

export function query(query = {}) {
	if (! supported) {
		return { matches: false, addEventListener: () => null, removeEventListener: () => null };
	} else {
		const queries = Object.entries(query).map(([k, v]) => `(${k}: ${v})`).join(' and ');
		return matchMedia(queries);
	}
}

export async function whenMatches(what = {}, { signal } = {}) {
	const mq = query(what);

	if (! mq.matches) {
		await when(mq, 'change', { signal });
	}

	return mq;
}

export function prefersReducedMotion() {
	return matches({ 'prefers-reduced-motion': 'reduce' });
}

export function prefersColorScheme() {
	return matches({ 'prefers-color-scheme': 'dark' }) ? 'dark': 'light';
}

export function displayMode() {
	const displays = ['browser', 'standalone', 'minimal-ui', 'fullscreen'];
	return displays.find(mode => matches({ 'display-mode': mode })) || 'browser';
}
