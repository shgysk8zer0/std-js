import { data, attr, ready, query } from './dom.js';

const COOKIE_NAME   = 'theme';
const THEMES        = ['light', 'dark', 'auto'];
const DEFAULT_THEME = 'auto';
const EVENT         = 'themechange';

if ('cookieStore' in globalThis && globalThis.cookieStore.get instanceof Function) {
	Promise.all([
		cookieStore.get({ name: COOKIE_NAME }),
		ready(),
	]).then(([cookie]) => {
		const $data = query(':root, [data-theme="auto"]');
		const $attr = query('[theme="auto"]');

		const setTheme = ({ name, value: theme = DEFAULT_THEME } = {}) => {
			if (name === COOKIE_NAME && THEMES.includes(theme)) {
				document.dispatchEvent(new CustomEvent(EVENT, { detail: { theme }}));
				requestAnimationFrame(() => {
					data($data, { theme });
					attr($attr, { theme });
				});
			}
		};

		if (cookie && typeof cookie.value === 'string') {
			setTheme(cookie);
		}

		globalThis.cookieStore.addEventListener('change', ({ changed, deleted }) => {
			const cookie = [...changed, ...deleted].find(({ name }) => name === COOKIE_NAME);

			if (cookie) {
				setTheme(cookie);
			}
		});
	});
}
