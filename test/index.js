import '../shims.js';
import '../deprefixer.js';
import { loadHandler } from './funcs.js';
import { $ } from '../functions.js';
// import kbdShortcuts from '../kbd_shortcuts.js';
import { loadScript } from '../loader.js';
import * as handlers from '../data-handlers.js';

$(document.documentElement, {
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
	'no-custom-elements': 'customElements' in window,
});

window.$ = $;

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

	$('[data-remove]').click(handlers.remove);
	$('[data-show]').click(handlers.show);
	$('[data-close]').click(handlers.close);
	$('[data-show-modal]').click(handlers.showModal);
	$('[data-scroll-to]').click(handlers.scrollTo);
	$('[data-toggle-class]').click(handlers.toggleClass);
	$('[data-toggle-attribute]').click(handlers.toggleAttribute);
	$doc.replaceClass('no-js', 'js');
	$doc.data({foo: {a: 1, b: [1,2]}, fooBar: false, url: new URL('./foo', document.baseURI), now: new Date()});
	$doc.attr({lang: 'en', dir: 'ltr'});
	loadHandler();
});
