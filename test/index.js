import '../shims.js';
import '../deprefixer.js';
import '../shims/trustedTypes.js';
import '../shims/sanitizer.js';
import '../theme-cookie.js';
import { loadHandler } from './funcs.js';
import { sleep } from '../promises.js';
import { toggleClass, on, replaceClass, data, attr, ready } from '../dom.js';
import { init } from '../data-handlers.js';
import { description, keywords, robots, thumbnail } from '../meta.js';
import { SanitizerConfig as sanitizerConfig } from '../SanitizerConfig.js';
import { createPolicy } from '../trust.js';

scheduler.postTask(() =>  Promise.allSettled([
	import('https://cdn.kernvalley.us/components/leaflet/map.min.js'),
	import('https://cdn.kernvalley.us/components/krv/ad.js'),
	import('https://cdn.kernvalley.us/components/krv/events.js'),
	import('https://cdn.kernvalley.us/components/github/user.js'),
	import('https://cdn.kernvalley.us/components/github/repo.js'),
	import('https://cdn.kernvalley.us/components/youtube/player.js'),
	import('https://cdn.kernvalley.us/components/spotify/player.js'),
	import('https://cdn.kernvalley.us/components/bacon-ipsum.js'),
]), { priority: 'background' }).then(console.log);

const sanitizer = new Sanitizer({
	...sanitizerConfig,
	allowCustomElements: true,
	allowElements: [
		...sanitizerConfig.allowElements, 'krv-ad', 'github-user', 'leaflet-map',
		'leaflet-marker', 'krv-events', 'weather-current', 'weather-forecast',
		'spotify-player', 'youtube-player', 'github-repo', 'bacon-ipsum',
	],
	allowAttributes: {
		...sanitizerConfig.allowAttributes,
		'url': ['krv-ad', 'spotify-player'],
		'uri': ['spotify-player'],
		'video': ['youtube-player'],
		'theme': ['krv-ad', 'krv-events', 'weather-current', 'weather-forecast'],
		'appid': ['weather-current', 'weather-forecast'],
		'paras': ['bacon-ipsum'],
		'postalcode': ['weather-current', 'weather-forecast'],
		'source': ['krv-ad'],
		'medium': ['krv-ad'],
		'content': ['krv-ad'],
		'campaign': ['krv-ad'],
		'layout': ['krv-ad'],
		'user': ['github-user', 'github-repo'],
		'repo': ['github-repo'],
		'bio': ['github-user'],
		'loading': ['krv-ad', 'github-user'],
		'zoomcontrol': ['leaflet-map'],
		'allowfullscreen': ['leaflet-map'],
		'allowlocate': ['leaflet-map'],
		'router': ['leaflet-map'],
		'zoom': ['leflet-map'],
		'minzoom': ['leaflet-map', 'leaflet-marker'],
		'maxzoom': ['leaflet-map', 'leaflet-marker'],
		'center': ['leaflet-map'],
		'latitude': ['leaflet-marker'],
		'longitude': ['leaflet-marker'],
		'open': ['leaflet-marker'],

	},
});
globalThis.sanitizer = sanitizer;

createPolicy('default', {
	createHTML: input => sanitizer.sanitizeFor('div', input).innerHTML,
	createScriptURL: input => {
		const url = new URL(input, document.baseURI);

		if ([location.origin, 'https://cdn.kernvalley.us'].includes(url.origin)) {
			return input;
		} else {
			return '';
		}
	},
	createScript: () => globalThis.trustedTypes.emptyScript.toString(),
});

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
