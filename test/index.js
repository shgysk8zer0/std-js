import '../deprefixer.js';
import '../theme-cookie.js';
import { loadHandler } from './funcs.js';
import { sleep } from '../promises.js';
import { toggleClass, on, replaceClass, data, attr, ready } from '../dom.js';
import { loadScript } from '../loader.js';
import { init } from '../data-handlers.js';
import { description, keywords, robots, thumbnail } from '../meta.js';
import { getDefaultPolicy } from '../trust-policies.js';

getDefaultPolicy();

scheduler.postTask(async () => {
	const policy = trustedTypes.defaultPolicy;
	const type = 'module';
	await Promise.all([
		loadScript('https://cdn.kernvalley.us/components/leaflet/map.min.js', { policy }),
		loadScript('https://cdn.kernvalley.us/components/krv/ad.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/krv/events.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/github/user.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/github/repo.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/youtube/player.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/spotify/player.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/bacon-ipsum.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/github/gist.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/codepen-embed.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/weather/current.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/weather/forecast.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/share-button.js', { policy, type }),
		loadScript('https://cdn.kernvalley.us/components/toast-message.js', { policy, type }),
	]).catch(console.error);
}, { priority: 'background' });

keywords(['javascript', 'ecmascript', 'es6', 'modules', 'library']);
description('This is a JavaScript library testing page');
robots(['nofollow', 'noindex', 'noarchive']);
thumbnail('https://i.imgur.com/CbFnOO9h.jpg');

toggleClass(document.documentElement, {
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
	'no-custom-elements': !('customElements' in window),
});

init();

cookieStore.addEventListener('change', async ({ changed, deleted }) => {
	const dialog = document.createElement('dialog');
	const header = document.createElement('h2');
	const changeList = document.createElement('details');
	const delList = document.createElement('details');
	const changeSum = document.createElement('summary');
	const delSum = document.createElement('summary');
	const controller = new AbortController();
	const { signal } = controller;
	const id = crypto.randomUUID();

	delList.classList.add('accordion');
	delList.open = deleted.length !== 0;
	changeList.classList.add('accordion');
	changeList.open = changed.length !== 0;

	header.textContent = 'Cookies';
	changeSum.textContent = 'Changed';
	delSum.textContent = 'Deleted';

	const makeItems = ({ name, value }) => {
		const item = document.createElement('div');
		item.textContent = `${name}: ${value}`;
		return item;
	};

	dialog.id = id;
	changeList.append(changeSum, ...changed.map(makeItems));
	delList.append(delSum, ...deleted.map(makeItems));
	dialog.append(header, changeList, delList);
	dialog.addEventListener('close', ({ target }) => {
		target.remove();
		controller.abort();
	}, { signal });

	requestIdleCallback(() => {
		on(document, {
			click: ({ target }) => {
				if (! target.matches('dialog[open], dialog[open] *')) {
					document.getElementById(id).close();
				}
			},
		}, { signal, passive: true });
	});

	document.body.append(dialog);
	dialog.showModal();
	await sleep(8000, { signal });
	dialog.close();
});

ready().finally(async () => {
	replaceClass(document.documentElement, 'no-js', 'js');
	data(document.documentElement, {
		foo: { a: 1, b: [1, 2] },
		fooBar: false,
		url: new URL('./foo', document.baseURI),
		now: new Date(),
	});

	attr(document.documentElement, { lang: 'en', dir: 'ltr' });
	loadHandler();
});
