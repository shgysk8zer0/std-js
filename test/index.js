import '../shims.js';
import '../deprefixer.js';
import '../theme-cookie.js';
import { loadHandler } from './funcs.js';
import { sleep } from '../functions.js';
import { $ } from '../esQuery.js';
// import kbdShortcuts from '../kbd_shortcuts.js';
import { loadScript } from '../loader.js';
import { init } from '../data-handlers.js';
import { CreditCard } from '../CreditCard.js';
import { description, keywords, robots, thumbnail } from '../meta.js';
window.CreditCard = CreditCard;

keywords(['javascript', 'ecmascript', 'es6', 'modules', 'library']);
description('This is a JavaScript library testing page');
robots(['nofollow', 'noindex', 'noarchive']);
thumbnail('https://i.imgur.com/CbFnOO9h.jpg');

$(document.documentElement).toggleClass({
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
	'no-custom-elements': !('customElements' in window),
});

window.$ = $;
init();

cookieStore.addEventListener('change', async ({ changed, deleted }) => {
	const dialog = document.createElement('dialog');
	const header = document.createElement('h2');
	const changeList = document.createElement('details');
	const delList = document.createElement('details');
	const changeSum = document.createElement('summary');
	const delSum = document.createElement('summary');

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

	changeList.append(changeSum, ...changed.map(makeItems));
	delList.append(delSum, ...deleted.map(makeItems));
	dialog.append(header, changeList, delList);
	dialog.addEventListener('close', ({ target }) => target.remove());
	document.body.append(dialog);
	dialog.showModal();
	await sleep(8000);
	dialog.close();
});

$.ready.then(async () => {
	const loads = [
		loadScript('https://cdn.polyfill.io/v3/polyfill.min.js'),
	];

	if (! ('customElements' in window)) {
		loads.push(loadScript('https://unpkg.com/@webcomponents/custom-elements@1.4.2/custom-elements.min.js', {
			integrity: 'sha384-xyhN4T4+9VPh8uXl6uWjGzsqwNXN9C2tla8b6zSrSqYlMFUoeCdoxiEJU0js+GNE',
		}));
	}

	if (! ('permissions' in navigator)) {
		loads.push('/permissions.js', { type: 'module' });
	}

	await Promise.allSettled(loads);

	const $doc = $(':root');
	$doc.replaceClass('no-js', 'js');
	$doc.data({foo: {a: 1, b: [1,2]}, fooBar: false, url: new URL('./foo', document.baseURI), now: new Date()});
	$doc.attr({lang: 'en', dir: 'ltr'});
	loadHandler();
});
