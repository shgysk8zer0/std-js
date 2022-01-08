import { data, attr, ready, query } from './dom.js';

if ('cookieStore' in globalThis && cookieStore.get instanceof Function) {
	cookieStore.get({ name: 'theme' }).then(async cookie => {
		await ready();

		const $data = query(':root, [data-theme="auto"]');
		const $attr = query('[theme="auto"]');

		const setTheme = async ({ name, value = 'auto' }) => {
			if (name === 'theme' && ['light', 'dark', 'auto'].includes(value)) {
				document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: value }}));

				await Promise.all([
					data($data, { theme: value }),
					attr($attr, { theme: value }),
				]);
			}
		};

		if (cookie && typeof cookie.value === 'string') {
			setTheme(cookie).catch(console.error);
		}

		cookieStore.addEventListener('change', ({ changed, deleted }) => {
			const cookie = [...changed, ...deleted].find(({ name }) => name === 'theme');

			if (cookie) {
				setTheme(cookie).catch(console.error);
			}
		});
	});
}
