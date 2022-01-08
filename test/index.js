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

const sanitizer = new Sanitizer(sanitizerConfig);

createPolicy('default', {
	createHTML: input => sanitizer.sanitizeFor('div', input).innerHTML,
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
